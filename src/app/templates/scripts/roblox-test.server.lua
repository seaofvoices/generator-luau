local ReplicatedStorage = game:GetService("ReplicatedStorage")

local jest = require("@pkg/@jsdotlua/jest")

local jestRoots = {
	<%- jestRoots %>
}

local success, result = jest.runCLI(ReplicatedStorage, {}, jestRoots):await()

if not success then
	error(result)
end

task.wait(0.5)
