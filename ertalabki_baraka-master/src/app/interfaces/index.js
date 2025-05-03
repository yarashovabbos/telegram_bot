/**
 * @typedef {Object} Tasks
 * @property {number} id - The unique identifier for the task
 * @property {string} title - The title of the task
 * @property {string} description - The detailed description of the task
 * @property {number} start_time - The start time of the task
 * @property {number} end_time - The end time of the task
 * @property {string} status - The current status of the task
 * @property {string} created_at - When the task was created
 * @property {string} updated_at - When the task was last updated
 * @property {string} user - The user associated with the task
 */

// Example task object
const exampleTask = {
  id: 1,
  title: "Complete project",
  description: "Finish the React project by deadline",
  start_time: 1620000000,
  end_time: 1620086400,
  status: "in_progress",
  created_at: "2023-05-01T12:00:00Z",
  updated_at: "2023-05-02T14:30:00Z",
  user: "user123",
}

// You can export the example if needed
export { exampleTask }
