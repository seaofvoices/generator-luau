#!/bin/sh

set -e

DARKLUA_CONFIG=$1
BUILD_OUTPUT=$2

if [ ! -d node_modules ]; then
    yarn install
fi
if [ ! -d node_modules/.luau-aliases ]; then
    yarn prepare
fi

rm -rf temp
mkdir -p temp
cp -r src/ temp/
cp -rL node_modules/ temp/

./scripts/remove-tests.sh temp

rojo sourcemap <%- rojoConfig %> -o sourcemap.json

darklua process --config "$DARKLUA_CONFIG" temp/src temp/src
darklua process --config "$DARKLUA_CONFIG" temp/node_modules temp/node_modules

cp <%- rojoConfig %> temp/

rm -f "$BUILD_OUTPUT"
mkdir -p $(dirname "$BUILD_OUTPUT")

rojo build temp/<%- rojoConfig %> -o "$BUILD_OUTPUT"
