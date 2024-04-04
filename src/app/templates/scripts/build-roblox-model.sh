#!/bin/sh

set -e

DARKLUA_CONFIG=$1
BUILD_OUTPUT=$2

if [ ! -d node_modules ]; then
    rm -rf temp
    <%- packageManager %> install
fi
if [ ! -d node_modules/.luau-aliases ]; then
    <%- packageManager %> run prepare
fi

rm -rf temp
mkdir -p temp
cp -r src/ temp/
cp -rL node_modules/ temp/
cp "$DARKLUA_CONFIG" "temp/$DARKLUA_CONFIG"

./scripts/remove-tests.sh temp

rojo sourcemap <%- rojoConfig %> -o temp/sourcemap.json

cd temp

darklua process --config "$DARKLUA_CONFIG" src src
darklua process --config "$DARKLUA_CONFIG" node_modules node_modules

cd ..

cp <%- rojoConfig %> temp/

rm -f "$BUILD_OUTPUT"
mkdir -p $(dirname "$BUILD_OUTPUT")

rojo build temp/<%- rojoConfig %> -o "$BUILD_OUTPUT"
