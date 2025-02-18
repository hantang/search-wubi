import logging
import pandas as pd

"""
df[[code,word(char)]] -> json
"""


def _filter_df(df, code_col, word_col, out_cols):
    df = df[df[code_col].notnull() & (df[word_col].notnull())].copy()
    df[code_col] = df[code_col].apply(lambda x: x.split("/"))
    df2 = df.explode(code_col)
    df2 = df2[[code_col, word_col]]
    df2.columns = out_cols[:2]
    return df2


def get_word_df(datafile, out_cols, tags):
    word_col = "word"
    code_col = "code"
    version_col = "tags"

    logging.info(f"Read file from {datafile}")
    df = pd.read_csv(datafile, sep="\t")
    # tags: ★/➆/ⓦ/ⓣ
    df[version_col] = df[version_col].fillna("").astype(str)
    df1a = df[df[version_col].str.contains("[★➆]")]
    df1b = df[~df[version_col].str.contains("[★➆]")]

    df2a = _filter_df(df1a, code_col, word_col, out_cols)
    df2b = _filter_df(df1b, code_col, word_col, out_cols)
    tag_cols = out_cols[2]
    df2a[tag_cols] = tags[0]
    df2b[tag_cols] = tags[1]

    df2 = pd.concat([df2a, df2b])
    logging.info(f"word df = {df2.shape}")
    return df2


def get_char_df(datafile, out_cols, tags):
    word_col = "char"
    code_col = "code"
    code2_col = "code_short"

    logging.info(f"Read file from {datafile}")
    df = pd.read_csv(datafile, sep="\t")

    df2a = _filter_df(df, code_col, word_col, out_cols)
    df2b = _filter_df(df, code2_col, word_col, out_cols)
    df2 = pd.concat([df2a, df2b])
    tag_cols = out_cols[2]
    df2[tag_cols] = tags[0]
    logging.info(f"char df = {df2.shape}")
    return df2
