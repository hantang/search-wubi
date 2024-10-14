#!/usr/bin/env bash
set -eu

TARGET="${1:-site}"
SOURCE="${2:-web}"

if [[ -d $TARGET ]]; then
    rm -rf $TARGET
fi

python scripts/parse.py data $SOURCE/data
cp -r $SOURCE $TARGET/

echo "Done"
