import argparse
import json
import logging

import pandas as pd
from pathlib import Path

from utils.decode import get_char_df, get_word_df
from utils.encode import df2dict, read_json_data, read_df_data
from utils.stats import get_stats3, get_stats2, get_top_chars, get_level_chars

from utils.config import CHAR_GROUPS, CHAR_LEVELS
from utils.config import INPUT_PATHS, OUTPUT_PATHS
from utils.config import OUTPUT_COLS, RENAMED_COLS


def save_all_to_json_v1(df, valid, chars_dict, data_dir, save_file):
    stats = get_stats2(df)
    top_chars = get_top_chars(df)
    result = {
        "stats": stats,
        "valid": valid,
        "top": top_chars,
        "chars": chars_dict,
    }

    logging.info(f"save to = {save_file}")
    with open(save_file, "w") as f:
        json.dump(result, f, indent=None, ensure_ascii=False)


def save_all_to_json_v2(df, data_valid, data_svg, chars_dict, save_file, save_dir):
    stats = get_stats3(df)
    top_chars = get_top_chars(df)
    all_chars = "".join(df["char"].tolist())
    level1_chars = get_level_chars(df, 1)
    level2_chars = get_level_chars(df, 2)
    level3_chars = get_level_chars(df, 3)
    fanti_chars = get_level_chars(df, 4)
    more_chars = get_level_chars(df, 5)

    result = {
        "stats": stats,
        "chars": {
            "all": all_chars,
            "top": top_chars,
            "level1": level1_chars,
            "level2": level2_chars,
            "level3": level3_chars,
            "fanti": fanti_chars,
            "more": more_chars,
            "wb98com": data_valid["wb98com"]["keep"],
            "hanzi-writer": data_valid["hanzi-writer"]["keep"],
            "svg": "".join(data_svg["char"]),
        },
        "config": {
            "path": OUTPUT_PATHS,
            "groups": CHAR_GROUPS,
            "levels": CHAR_LEVELS,
        },
    }

    logging.info(f"save to = {save_file}")
    with open(save_file, "w") as f:
        json.dump(result, f, indent=None, ensure_ascii=False)

    # if save_dir:
    logging.info(f"Save to {save_dir}, data = {len(chars_dict)}")
    for char, char_info in chars_dict.items():
        subdir = Path(save_dir, hex(ord(char))[-2:].lower())
        char_file = Path(subdir, f"{char}.json")
        if not subdir.exists():
            subdir.mkdir(parents=True)
        with open(char_file, "w") as f:
            json.dump(char_info, f, indent=None, ensure_ascii=False)


def save_decode_to_json(data_dir: str, save_path: str) -> None:
    tag_options = ["c", "w", "x"]  # char, word, extra-word
    output_cols = ["element", "code", "tag"]
    out_col = "output"
    code_col, element_col, tag_col = output_cols

    save_dir = Path(save_path, OUTPUT_PATHS["codes"])
    if not save_dir.exists():
        logging.info(f"Create dir={save_dir}")
        save_dir.mkdir(parents=True)

    datafile = Path(data_dir, INPUT_PATHS["dataframe-word"])
    dfw = get_word_df(datafile, output_cols, tag_options[1:])

    datafile = Path(data_dir, INPUT_PATHS["dataframe"][1])
    dfc = get_char_df(datafile, output_cols, tag_options[:1])
    df = pd.concat([dfw, dfc])

    df2 = df.groupby([code_col, tag_col])[element_col].agg(list)
    df2 = df2.apply(lambda x: "/".join(x))

    logging.info(f"group df = {df2.shape}")

    df3 = df2.unstack().fillna("")
    df3[out_col] = df3.apply(lambda x: {k: x[k] for k in tag_options}, axis=1)
    logging.info(f"concat df = {df3.shape}")

    out = df3[out_col].to_dict()
    out2 = {}
    for k, v in out.items():
        k2 = k * 2 if len(k) == 1 else k[:2]
        if k2 not in out2:
            out2[k2] = {}
        out2[k2][k] = v

    logging.debug(f"Save to {save_dir}, data={len(out2)}")
    for k, v in out2.items():
        save_file = Path(save_dir, f"{k}.json")
        logging.debug(f"Save to {save_file}, data={len(v)}")
        with open(save_file, "w") as f:
            json.dump(v, f, indent=None, ensure_ascii=False)


def save_svg_to_json(data_svg: dict, save_path: str) -> None:
    fontData = data_svg["font"]
    save_dir = Path(save_path, OUTPUT_PATHS["svgs"])
    logging.info(f"Font data = {len(fontData)}, save to {save_dir}")

    if not save_dir.exists():
        logging.info(f"Create dir={save_dir}")
        save_dir.mkdir(parents=True)

    for k, v in fontData.items():
        save_file = Path(save_dir, f"{k}.json")
        logging.debug(f"Save to {save_file}, data={len(v)}")
        with open(save_file, "w") as f:
            v2 = {"path": v}
            json.dump(v2, f, indent=None, ensure_ascii=False)


def run(data_dir: str, save_path: str, version: str, decode=None) -> None:
    save_dir = Path(save_path)
    save_file = Path(save_dir, OUTPUT_PATHS["datafile"])
    if not save_file.parent.exists():
        logging.info(f"Create dir = {save_dir}")
        save_file.parent.mkdir(parents=True)

    df = read_df_data(data_dir, INPUT_PATHS["dataframe"])
    data_valid = read_json_data(data_dir, INPUT_PATHS["valid"])
    data_svg = read_json_data(data_dir, INPUT_PATHS["svg"])
    if df is None:
        logging.warning(f"Error no tsv in {data_dir}")
        return
    logging.info(f"df = {df.shape}")

    chars_dict = df2dict(df, RENAMED_COLS, OUTPUT_COLS)
    if version == "v1":
        save_all_to_json_v1(df, data_valid, chars_dict, data_dir, save_file)
    else:
        chars_save_dir = Path(save_dir, OUTPUT_PATHS["chars"])
        if not chars_save_dir.exists():
            chars_save_dir.mkdir(parents=True)
        save_all_to_json_v2(df, data_valid, data_svg, chars_dict, save_file, chars_save_dir)
        if decode:
            save_decode_to_json(data_dir, save_path)

        # save svg info
        save_svg_to_json(data_svg, save_path)


if __name__ == "__main__":
    fmt = "%(asctime)s %(filename)s [line:%(lineno)d] %(levelname)s %(message)s"
    logging.basicConfig(level=logging.INFO, format=fmt)

    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--input", type=str, default="data", help="input data")
    parser.add_argument("-o", "--output", type=str, default="out", help="output json")
    parser.add_argument("-v", "--version", type=str, default="v1")
    parser.add_argument("--decode", action="store_true")

    args = parser.parse_args()
    logging.info(f"args = {args}")
    run(args.input, args.output, args.version, args.decode)
