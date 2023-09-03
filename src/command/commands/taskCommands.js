import { TaskCommand } from "../TaskCommand.js";

const article = new TaskCommand("article", "articles");
const delegated = new TaskCommand("delegated", "delegated things");
const idea = new TaskCommand("idea", "ideas");
const project = new TaskCommand("project", "projects");
const task = new TaskCommand("task", "tasks");

export { task };
