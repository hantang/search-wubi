#!/usr/bin/env bash
set -eu

TARGET="${1:-site}"
SOURCE="${2:-web}"

echo "install deps"
pip install -r requirements.txt >/dev/null 2>&1

if [[ -d $TARGET ]]; then
    echo "clean $TARGET"
    rm -rf $TARGET
fi

echo "Create data"
python scripts/parse.py data $SOURCE/data >/dev/null 2>&1
cp -r $SOURCE $TARGET

echo "Copy assets"
cp -r data/assets $TARGET/

echo "Done"
