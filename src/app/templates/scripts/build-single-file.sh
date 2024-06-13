#!/bin/sh

set -e

DARKLUA_CONFIG=$1
BUILD_OUTPUT=$2

if [ ! -d node_modules ]; then
    <%- packageManager %> install
fi
if [ ! -d node_modules/.luau-aliases ]; then
    <%- packageManager %> run prepare
fi

rm -rf temp
mkdir -p temp
cp -r src/ temp/
cp -rL node_modules/ temp/

./scripts/remove-tests.sh temp

rm -f "$BUILD_OUTPUT"
mkdir -p $(dirname "$BUILD_OUTPUT")

darklua process --config "$DARKLUA_CONFIG" temp/<%- entryPoint %> "$BUILD_OUTPUT"

rm -rf temp
