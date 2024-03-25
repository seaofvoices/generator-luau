local jestGlobals = require("@pkg/@jsdotlua/jest-globals")

local expect = jestGlobals.expect
local it = jestGlobals.it

it("tests something", function()
    expect(false).toEqual(true)
end)
