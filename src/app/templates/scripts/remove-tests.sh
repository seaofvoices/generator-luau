#!/bin/sh

set -e

FOLDER=$1

find $FOLDER -name '__tests__' -type d -exec rm -r {} +
find $FOLDER -name 'tests' -type d -exec rm -r {} +
find $FOLDER -name '*.spec.<%- luaExtension %>' -type f -exec rm -r {} +
find $FOLDER -name '*.test.<%- luaExtension %>' -type f -exec rm -r {} +
find $FOLDER -name 'jest.config.<%- luaExtension %>' -type f -exec rm -r {} +
