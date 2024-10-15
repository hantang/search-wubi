import argparse
import json
import logging

import pandas as pd
from pathlib import Path

RENAMED_COLS = {
    "Unicode": "unicode",
    "全码": "fullCode",
    "简码": "shortCode",
    "容错码": "faultCode",
    "拼音": "pinyin",
    "笔画数": "stroke",
    "字根拆解": "units",
    "字表来源": "source",
    "笔画拆解": "segments",
    "识别码": "flag",
}

OUTPUT_COLS = [
    "unicode",
    "pinyin",
    "stroke",
    "source",
    "freq",
    "unitType",
    "fullCode",
    "shortCode",
    "faultCode",
    "units",
    "segments",
    "flag",
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


def read_source(data_dir: str):
    files = Path(data_dir).glob("*.tsv")
    df_list = [pd.read_csv(file, sep="\t") for file in files]
    if len(df_list) == 0:
        return None
    df = df_list[0]
    for df2 in df_list[1:]:
        df = df.merge(df2, how="left")
    return df


def get_stats(df, col="字表来源"):
    col_temp = "字表分级"
    col_out = "字表"
    sources = [
        v.strip()
        for line in df[col].fillna("").tolist()
        for v in line.strip().split("/")
        if v.strip()
    ]
    df_stats = pd.Series(sources, name=col_temp).value_counts().reset_index()

    names = CHAR_NAMES
    df_stats[col_out] = df_stats[col_temp].apply(lambda x: names.get(x, x))
    result = df_stats[[col_out, "count"]].to_dict("records")
    out = {"names": names, "stats": result, "total": df.shape[0]}

    for key in ["全码", "字根拆解", "笔画拆解"]:
        out[RENAMED_COLS[key]] = df[df[key].fillna("") != ""].shape[0]
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
    keys = ["键名字根", "笔画字根", "成字字根"]
    vals = [k[:2] if x[k] == 1 else "" for k in keys]
    vals = [v for v in vals if v]
    if vals:
        return "字根（{}）".format("，".join(vals))
    return ""


def _full_code(x):
    fullcode = x["全码"]
    if x["识别码"]:
        return "{};{}".format(fullcode[:-1], fullcode[-1])
    else:
        return fullcode


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

    for col in ["全码", "简码", "容错码", "字根拆解", "笔画拆解", "识别码", "笔画数"]:
        df[col] = df[col].fillna("").astype(str)
    for col in ["现代汉语语料库字频（%）", "刑红兵25亿字语料字频（百万）"]:
        df[col] = df[col].fillna(0).astype(float)

    df["fullCode"] = df.apply(_full_code, axis=1)
    df["units"] = df["字根拆解"].apply(lambda x: " ".join(x.split("※")))
    df["segments"] = df["笔画拆解"].apply(_to_int_array)

    keys = ["现代汉语语料库字频（%）", "刑红兵25亿字语料字频（百万）"]
    df["freq"] = df.apply(lambda x: [x[k] for k in keys], axis=1)
    # "五笔常用前1500", "一级简码", "二级简码",
    df["unitType"] = df.apply(_unit_type, axis=1)

    stats = get_stats(df)
    renames = {k: v for k, v in RENAMED_COLS.items() if v not in df.columns}
    df = df.rename(columns=renames)
    df = df.set_index("汉字")

    df2 = df[OUTPUT_COLS]
    logging.info(f"output data = {df2.shape}")

    out = df2.to_dict("index")
    result = {"stats": stats, "chars": out}

    logging.info(f"save to = {save_file}")
    with open(save_file, "w") as f:
        json.dump(result, f, indent=None, ensure_ascii=False)


if __name__ == "__main__":
    fmt = "%(asctime)s %(filename)s [line:%(lineno)d] %(levelname)s %(message)s"
    logging.basicConfig(level=logging.INFO, format=fmt)

    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=str, default="data")
    parser.add_argument("output", type=str, default="out", help="output dir")

    args = parser.parse_args()
    logging.info(f"args = {args}")
    tsv_to_json(args.input, args.output)
