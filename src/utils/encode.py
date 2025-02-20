import json
import logging
from pathlib import Path

import pandas as pd


def read_df_data(data_dir: str, names: list):
    # INPUT_PATHS["dataframe"]
    df_list = [pd.read_csv(Path(data_dir, name), sep="\t") for name in names]
    if len(df_list) == 0:
        return None
    df = df_list[0]
    for df2 in df_list[1:]:
        df = df.merge(df2, how="left")
    return df


def read_json_data(data_dir: str, name: str) -> dict:
    # INPUT_PATHS["valid"]
    data_file = Path(data_dir, name)
    if not data_file.exists():
        logging.warning(f"No data {data_file}")
        return dict()
    with open(data_file, encoding="utf-8", newline="\n") as f:
        data = json.load(f)
    return data


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
    full_code = x["code"]
    if x["flag"]:  # 识别码
        return "{};{}".format(full_code[:-1], full_code[-1])
    else:
        return full_code


def _get_groups(x):
    # return ["L" + str(x["group"]), x["level"]]
    new_group = {
        "A1a": "L0",
        "A1b": "L0",
        "A2": "L0",
        "A3": "L0",
        "A4": "L1",
        "B1": "L2",
        "B2": "L3",
        "B3": "L3",
        "B4": "L3",
    }
    return [new_group.get(x["group"], ""), x["level"]]


def df2dict(df_data, renamed_cols, output_cols):
    cols = ["code", "code_short", "code_more", "units", "segments", "flag", "strokes", "radical"]
    df = df_data.copy()
    for col in cols:
        df[col] = df[col].fillna("").astype(str)
    df["groups"] = df[["group", "level"]].fillna("").apply(_get_groups, axis=1)
    df["code"] = df.apply(_full_code, axis=1)
    df["units"] = df["units"].apply(lambda x: " ".join(x.strip("〖〗").split("※")))
    df["segments"] = df["segments"].apply(_to_int_array)
    df["unitType"] = df.apply(_unit_type, axis=1)

    df = df.set_index("char")
    renames = {k: v for k, v in renamed_cols.items() if v not in df.columns}
    df = df.rename(columns=renames)
    df2 = df[output_cols].fillna("")

    logging.info(f"output data = {df2.shape}")
    char_dict = df2.to_dict("index")
    return char_dict
