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
    "字根拆解": "units",
    "字表来源": "source",
}

OUTPUT_COLS = [
    "unicode",
    "pinyin",
    "source",
    "freq",
    "fullCode",
    "shortCode",
    "faultCode",
    "units",
    "segments",
]


def read_source(data_dir: str):
    files = Path(data_dir).glob("*.tsv")
    df_list = [pd.read_csv(file, sep="\t") for file in files]
    if len(df_list) == 0:
        return None
    df = df_list[0]
    for df2 in df_list[1:]:
        df = df.merge(df2, how="left")
    return df


def _to_int_array(x: str) -> list:
    return [[int(u) for u in v.split(",") if u] for v in x.split("/")]


def tsv_to_json(data_dir: str, save_dir: str) -> None:

    save_dir = Path(save_dir)
    save_file = Path(save_dir, "data.json")
    if not save_dir.exists():
        logging.info(f"Create dir = {save_dir}")
        save_dir.mkdir(parents=True)

    df = read_source(data_dir)
    if df is None:
        logging.warning(f"Error no tsv in {data_dir}")
        return
    logging.info(f"df = {df.shape}")

    for col in ["全码", "简码", "容错码", "字根拆解", "笔画拆解"]:
        df[col] = df[col].fillna("").astype(str)
    for col in ["现代汉语语料库字频（%）", "刑红兵25亿字语料字频（百万）"]:
        df[col] = df[col].fillna(0).astype(float)

    df.index = df["汉字"]
    df = df.rename(columns=RENAMED_COLS)
    df["segments"] = df["笔画拆解"].apply(_to_int_array)

    keys = ["现代汉语语料库字频（%）", "刑红兵25亿字语料字频（百万）"]
    df["freq"] = df.apply(lambda x: [x[k] for k in keys], axis=1)
    # keys = ["五笔常用前1500", "一级简码", "二级简码", "键名字根", "笔画字根", "成字字根"]
    # df["level"] = df.apply(lambda x: [x[k] for k in keys], axis=1)

    df2 = df[OUTPUT_COLS]
    logging.info(f"output data = {df.shape}")

    out = df2.to_dict("index")
    logging.info(f"save to = {save_file}")
    with open(save_file, "w") as f:
        json.dump(out, f, indent=None, ensure_ascii=False)


if __name__ == "__main__":
    fmt = "%(asctime)s %(filename)s [line:%(lineno)d] %(levelname)s %(message)s"
    logging.basicConfig(level=logging.INFO, format=fmt)

    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=str, default="data")
    parser.add_argument("output", type=str, default="out", help="output dir")

    args = parser.parse_args()
    logging.info(f"args = {args}")
    tsv_to_json(args.input, args.output)
