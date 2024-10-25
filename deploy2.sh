#!/usr/bin/env bash
set -eu

TARGET="${1:-site}"
SOURCE="${2:-docs}"

echo "Install deps"
pip install -r requirements.txt >/dev/null 2>&1

if [[ -d $TARGET ]]; then
    echo "Clean $TARGET"
    rm -rf $TARGET
fi

if [[ -d $SOURCE/data ]]; then
    echo "Clean $SOURCE/data"
    rm -rf $SOURCE/data
    mkdir -p "$SOURCE/data"
fi

echo "Create data"
python src/parse.py -i data -o $SOURCE -v v2 --decode >/dev/null 2>&1

echo "Copy assets"
cp -r data/assets $SOURCE/data/

echo "Build site"
mkdocs build
rm -rf $TARGET/wiki/data/*.tsv

echo "Done"
