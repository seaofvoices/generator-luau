#!/bin/sh

set -e

DARKLUA_CONFIG="<%- darkluaConfig %>"

if [ ! -d node_modules ]; then
    rm -rf temp
    yarn install
fi

if [ -d "temp" ]; then
    ls -d temp/* | grep -v node_modules | xargs rm -rf
fi

rojo sourcemap <%- testRojoProjectFile %> -o sourcemap.json

<%= folders.map(dirName => `darklua process --config $DARKLUA_CONFIG ${dirName} temp/${dirName}`).join('\n') %>

cp <%- testRojoProjectFile %> temp/

rojo build temp/<%- testRojoProjectFile %> -o place.rbxl

run-in-roblox --place place.rbxl --script temp/scripts/roblox-test.server.lua
