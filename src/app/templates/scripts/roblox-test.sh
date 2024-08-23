#!/bin/sh

set -e

DARKLUA_CONFIG="<%- darkluaConfig %>"

if [ ! -d node_modules ]; then
    <%- packageManager %> install
fi
if [ ! -d node_modules/.luau-aliases ]; then
    <%- packageManager %> prepare
fi

rm -rf temp

rojo sourcemap <%- testRojoProjectFile %> -o sourcemap.json

<%= folders.map(dirName => `darklua process --config $DARKLUA_CONFIG ${dirName} temp/${dirName}`).join('\n') %>

cp <%- testRojoProjectFile %> temp/

rojo build temp/<%- testRojoProjectFile %> -o temp/test-place.rbxl

run-in-roblox --place temp/test-place.rbxl --script temp/scripts/roblox-test.server.<%- luaExtension %>

rm -rf temp
