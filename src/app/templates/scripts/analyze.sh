#!/bin/sh

set -e

luau-lsp analyze --base-luaurc=.luaurc --settings=.luau-analyze.json \
    --ignore '**/node_modules/**' --ignore 'node_modules/**' \
    <%- root %>
