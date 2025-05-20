#!/bin/sh

set -e

luau-lsp analyze --base-luaurc=.luaurc \
    --ignore '**/node_modules/**' --ignore 'node_modules/**' \
    <%- root %>
