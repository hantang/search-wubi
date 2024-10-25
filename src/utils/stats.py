import logging

import pandas as pd
from .config import CHAR_GROUPS, CHAR_LEVELS


def get_stats3(df: pd.DataFrame) -> dict:
    stats = {
        key: df[df[key].fillna("") != ""].shape[0]
        for key in ["code", "units", "segments"]
    }
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
    df1 = df[(df["level"] == "一级") | (df["basic"] == 1)]

    rest = count - len(df1)
    df2 = df[~df["char"].isin(df1["char"])].sort_values("freq2").head(rest)

    df_top = pd.concat([df1, df2]).sort_values("freq2")
    chars = df_top["char"].tolist()

    logging.info(f"top chars = {len(chars)}")
    return "".join(chars)
