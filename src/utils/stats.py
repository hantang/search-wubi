import logging

import pandas as pd
from .config import CHAR_GROUPS, CHAR_LEVELS


def get_stats3(df: pd.DataFrame) -> dict:
    stats = {key: df[df[key].fillna("") != ""].shape[0] for key in ["code", "units", "segments"]}
    stats["total"] = len(df)
    return stats


def get_stats2(df: pd.DataFrame) -> dict:
    stats = get_stats3(df)
    result = {
        "count": stats,
        "groups": CHAR_GROUPS,
        "levels": CHAR_LEVELS,
    }
    return result


def get_top_chars(df, count=4000):
    df["freq2"] = df["freq"].fillna(0).rank(ascending=False)
    df["basic"] = df["basic"].fillna(0).astype(int)
    levels = ["一级", "二级"]
    df1 = df[(df["level"].isin(levels)) | (df["basic"] == 1) | (df["group"] == "B1")]

    # rest = count - len(df1)
    # df2 = df[~df["char"].isin(df1["char"])].sort_values("freq2").head(rest)

    df_top = df1.sort_values("freq2")
    chars = df_top["char"].head(count).tolist()

    logging.info(f"top chars = {len(chars)}")
    return "".join(chars)


def get_level_chars(df, level):
    levels = {1: "一级", 2: "二级", 3: "三级"}
    df_lv = df[(df["level"] == levels[level])]

    chars = df_lv["char"].tolist()

    logging.info(f"level={level} / {levels[level]} chars = {len(chars)}")
    return "".join(chars)
