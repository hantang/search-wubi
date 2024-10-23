#!/usr/bin/env bash
set -eu

TARGET="${1:-site}"
SOURCE="${2:-docs}"

echo "install deps"
pip install -r requirements.txt >/dev/null 2>&1

if [[ -d $TARGET ]]; then
    echo "clean $TARGET"
    rm -rf $TARGET
fi

echo "Create data"
python scripts/parse.py --input data --out $SOURCE --version v2 # >/dev/null 2>&1

echo "Copy assets"
cp -r data/assets $SOURCE/data/

echo "build"
mkdocs build

rm -rf $TARGET/wiki/data/*.tsv

echo "Done"
