---
title: 五笔-重码统计
---

## 二重码

{{ read_csv("./data/code-dup1.tsv", sep="\t", engine="python") }}

## 二重码（更多 1）

{{ read_csv("./data/code-dup2.tsv", sep="\t", engine="python") }}

## 二重码（更多 2）

{{ read_csv("./data/code-dup3.tsv", sep="\t", engine="python") }}

## 多重码

{{ read_csv("./data/code-dup4.tsv", sep="\t", engine="python") }}
