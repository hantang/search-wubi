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

RENAMED_COLS = {
    "code_short": "shortCode",
    "code_more": "faultCode",
}

# CHAR_NAMES = {
#     "一级": "《通用规范汉字表》（2012年）一级汉字",
#     "二级": "《通用规范汉字表》（2012年）二级汉字",
#     "三级": "《通用规范汉字表》（2012年）三级汉字",
#     "GB2312": "《信息交换用汉字编码字符集》（GB/T 2312-1980）",
#     "常用字": "《现代汉语常用字表》（1988年）常用字",
#     "次常用字": "《现代汉语常用字表》（1988年）次常用字",
#     "通用字": "《现代汉语通用字表》（1988年）通用字",
#     "其他": "其他常用汉字",
# }

# CHAR_GROUPS = {
#     "L0": ["规范", "通用规范汉字"],
#     "L1": ["繁体", "通用规范汉字的繁体"],
#     "L2": ["港台", "港台地区常用字补充"],
#     "L3": ["旧表", "旧字表中用字补充"],
#     "L4": ["其他", "其他常用字补充"],
#     "L5": ["地名", "地名用字补充"],
# }
CHAR_GROUPS = {
    "L0": ["规范", "通用规范汉字"],
    "L1": ["繁体", "繁体汉字及港台常用字"],
    "L2": ["表外", "表外常用字补充"],
    "L3": ["其他", "其他常用字补充"],
}

CHAR_LEVELS = {
    "一级": "《通用规范汉字表》（2012年）一级字",
    "二级": "《通用规范汉字表》（2012年）二级字",
    "三级": "《通用规范汉字表》（2012年）三级字",
    "一级〔繁〕": "通用规范汉字一级字的繁体",
    "二级〔繁〕": "通用规范汉字二级字的繁体",
    "三级〔繁〕": "通用规范汉字三级字的繁体",
}

OUTPUT_PATHS = {
    "chars": "data/chars",  # char.json
    "assets": "data/assets",  # char.gif
    "codes": "data/code",
    "datafile": "data/data.json",
    "svgs": "data/svgs",
}

INPUT_PATHS = {
    "dataframe": ["data-chars.tsv", "data-wubi-v86.tsv"],
    "dataframe-word": "words-wubi-v86.tsv",
    "valid": "valid-chars.json",
    "svg": "data-svg.json",
}
