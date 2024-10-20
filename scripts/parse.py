import argparse
import json
import logging

import pandas as pd
from pathlib import Path

RENAMED_COLS = {
    "code_short": "shortCode",
    "code_more": "faultCode",
}
OUTPUT_COLS = [
    "unicode",
    "groups",
    "ids",
    "strokes",
    "pinyin",
    "radical",
    "basic",
    "code",
    "shortCode",
    "faultCode",
    "units",
    "flag",
    "segments",
    "unitType",
]


CHAR_NAMES = {
    "一级": "《通用规范汉字表》（2012年）一级汉字",
    "二级": "《通用规范汉字表》（2012年）二级汉字",
    "三级": "《通用规范汉字表》（2012年）三级汉字",
    "GB2312": "《信息交换用汉字编码字符集》（GB/T 2312-1980）",
    "常用字": "《现代汉语常用字表》（1988年）常用字",
    "次常用字": "《现代汉语常用字表》（1988年）次常用字",
    "通用字": "《现代汉语通用字表》（1988年）通用字",
    "其他": "其他常用汉字",
}
CHAR_GROUPS = {
    "L0": ["规范", "通用规范汉字"],
    "L1": ["繁体", "通用规范汉字的繁体"],
    "L2": ["港台", "港台地区常用字补充"],
    "L3": ["旧表", "旧字表中用字补充"],
    "L4": ["其他", "其他常用字补充"],
    "L5": ["地名", "地名用字补充"],
}

CHAR_LEVELS = {
    "一级": "《通用规范汉字表》（2012年）一级字",
    "二级": "《通用规范汉字表》（2012年）二级字",
    "三级": "《通用规范汉字表》（2012年）三级字",
    "一级〔繁〕": "通用规范汉字一级字的繁体",
    "二级〔繁〕": "通用规范汉字二级字的繁体",
    "三级〔繁〕": "通用规范汉字三级字的繁体",
}


def read_source(data_dir: str):
    names = ["data-chars.tsv", "data-wubi-v86.tsv"]
    df_list = [pd.read_csv(Path(data_dir, name), sep="\t") for name in names]
    if len(df_list) == 0:
        return None
    df = df_list[0]
    for df2 in df_list[1:]:
        df = df.merge(df2, how="left")
    return df


def get_valid(data_dir: str) -> dict:
    data_file = Path(data_dir, "valid-chars.json")
    with open(data_file) as f:
        data = json.load(f)
    return data


def get_stats2(df: pd.DataFrame) -> dict:
    counts = {
        key: df[df[key].fillna("") != ""].shape[0]
        for key in ["code", "units", "segments"]
    }
    counts["total"] = len(df)
    out = {
        "count": counts,
        "groups": CHAR_GROUPS,
        "levels": CHAR_LEVELS,
    }
    return out


def _to_int_array(x: str) -> list:
    """
    format:
        0,1/2,3,4,5/6,7
        0-7/8-12,15/13,14
    """
    out = []
    for v in x.strip("*").split("/"):
        v = v.strip()
        if v == "":
            continue
        nums = v.split(",")
        nums2 = []
        for val in nums:
            if "-" in val:
                start, end = val.split("-")
                nums2.extend(list(range(int(start), int(end) + 1)))
            else:
                nums2.append(int(val))
        nums2 = sorted(nums2)
        out.append(nums2)
    return out


def _unit_type(x):
    names = ["键名字根", "笔画字根", "成字字根"]
    keys = ["key_unit", "stroke_unit", "char_unit"]
    vals = [names[i][:2] if x[k] == 1 else "" for i, k in enumerate(keys)]
    vals = [v for v in vals if v]
    if vals:
        return "字根（{}）".format("，".join(vals))
    return ""


def _full_code(x):
    fullcode = x["code"]
    if x["flag"]:  # 识别码
        return "{};{}".format(fullcode[:-1], fullcode[-1])
    else:
        return fullcode


def _get_groups(x):
    return ["L" + str(x["group"]), x["level"]]


def tsv_to_json(data_dir: str, save_path: str) -> None:
    save_dir = Path(save_path)
    save_file = Path(save_dir, "data.json")
    if not save_dir.exists():
        logging.info(f"Create dir = {save_dir}")
        save_dir.mkdir(parents=True)

    df = read_source(data_dir)
    if df is None:
        logging.warning(f"Error no tsv in {data_dir}")
        return
    logging.info(f"df = {df.shape}")
    stats = get_stats2(df)

    cols = [
        "code",
        "code_short",
        "code_more",
        "units",
        "segments",
        "flag",
        "strokes",
        "radical",
    ]
    for col in cols:
        df[col] = df[col].fillna("").astype(str)
    df["groups"] = df[["group", "level"]].fillna("").apply(_get_groups, axis=1)
    df["code"] = df.apply(_full_code, axis=1)
    df["units"] = df["units"].apply(lambda x: " ".join(x.strip("〖〗").split("※")))
    df["segments"] = df["segments"].apply(_to_int_array)
    df["unitType"] = df.apply(_unit_type, axis=1)

    df = df.set_index("char")
    renames = {k: v for k, v in RENAMED_COLS.items() if v not in df.columns}
    df = df.rename(columns=renames)
    df2 = df[OUTPUT_COLS]
    logging.info(f"output data = {df2.shape}")

    out = df2.to_dict("index")
    valid = get_valid(data_dir)
    result = {"stats": stats, "valid": valid, "chars": out}

    logging.info(f"save to = {save_file}")
    with open(save_file, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    fmt = "%(asctime)s %(filename)s [line:%(lineno)d] %(levelname)s %(message)s"
    logging.basicConfig(level=logging.INFO, format=fmt)

    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=str, default="data")
    parser.add_argument("output", type=str, default="out", help="output dir")

    args = parser.parse_args()
    logging.info(f"args = {args}")
    tsv_to_json(args.input, args.output)
