import { LinearClient } from "@linear/sdk";

import { HelpEntry } from "../HelpEntry.js";
import { TodoCommand } from "../TodoCommand.js";

import { default as config } from "../../../config.js";

const linearClient = new LinearClient({
  apiKey: config.linear.token,
});

class LinearCommand extends TodoCommand {
  constructor() {
    super("linear", "linear issues");

    this.help = new HelpEntry("linear", "Manage Linear tasks.").addSubEntry(
      "list (optionally: all|n,n)",
      "Show 'em!  Try e.g. 'list -5'"
    );
  }

  #formatLinearIssueAsObject(issue) {
    return {
      id: issue.identifier,
      title: issue.title,
      created: issue.createdAt,
      done: issue.completedAt || issue.canceledAt,
      due: issue.dueDate ? new Date(issue.dueDate) : undefined,
      type: 'linear',
    };
  }

  async findById(id) {
    const issue = await linearClient.issue(id);
    return this.#formatLinearIssueAsObject(issue);
  }

  async findAll(done) {
    if (done) {
      throw new Error("Done Linear tasks are not available for now.");
    }

    const me = await linearClient.viewer;
    const myIssues = await me.assignedIssues();

    const now = new Date();
    const issues = myIssues.nodes
      .filter((item) => !item.completedAt && !item.canceledAt)
      // also filter out those that are in a future cycle
      .filter(async (task) => {
        const cycle = await task.cycle;
        return !cycle?.startsAt || cycle.startsAt > now;
      })
      .map((issue) => this.#formatLinearIssueAsObject(issue));

    return issues;
  }

  async isDone(linearIssueShapedObject) {
    return linearIssueShapedObject.done;
  }
}

const linear = new LinearCommand();

export { linear };
