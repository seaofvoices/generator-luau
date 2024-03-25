#!/bin/sh

set -e

luau-lsp analyze --base-luaurc=.luaurc --settings=.luau-analyze.json \
    <%- root %>
