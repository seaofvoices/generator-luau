#!/bin/sh

set -e

FOLDER=$1

find "$FOLDER" -name '__tests__' -type d -exec rm -r {} +
find "$FOLDER" -name 'tests' -type d -exec rm -r {} +
find "$FOLDER" -name '*.spec.lua' -type f -exec rm -r {} +
find "$FOLDER" -name '*.spec.luau' -type f -exec rm -r {} +
find "$FOLDER" -name '*.test.lua' -type f -exec rm -r {} +
find "$FOLDER" -name '*.test.luau' -type f -exec rm -r {} +
find "$FOLDER" -name 'jest.config.lua' -type f -exec rm -r {} +
find "$FOLDER" -name 'jest.config.luau' -type f -exec rm -r {} +
