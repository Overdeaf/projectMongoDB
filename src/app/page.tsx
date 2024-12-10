"use client";

import { useState, useEffect, FC } from "react";
import {
  createTask,
  deleteTask,
  doneTask,
  getTaskFromDB,
  updateTask,
} from "./api/apis.ts";

type tasks = {
  id: number;
  title: string;
  description: string;
  created_at: Date;
  is_completed: boolean;
};

const HomePage = () => {
  const [tasks, setTasks] = useState<tasks[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchTasks = async () => {
    const response: tasks[] = await getTaskFromDB();
    // sort by time created
    response.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    setTasks(response);
  };

  const addTask = async () => {
    if (!newTaskTitle.length || !newTaskDescription.length) {
      alert("Please fill in all fields");
      return;
    }
    const success = await createTask(newTaskTitle, newTaskDescription);
    if (success) {
      fetchTasks();
      setNewTaskTitle("");
      setNewTaskDescription("");
      setIsAdding(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div style={{ background: "#CAF4FF", padding: "15px" }}>
        <h1 style={{ textAlign: "center", color: "#03001C" }}>Task checker</h1>
      </div>
      {/* END OF HEADER */}
      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
        }}
      >
        <h2
          style={{
            padding: "20px",
            background: "#CAF4FF",
            textAlign: "center",
            borderRadius: "20px",
          }}
        >
          List of tasks
        </h2>
        <button
          style={{
            color: "#03001C",
            textAlign: "center",
            height: "30px",
            backgroundColor: "#CAF4FF",
            padding: "5px 15px 5px 15px",
            fontSize: "16px",
            borderRadius: "20px",
            width: "100px",
          }}
          onClick={() => setIsAdding(!isAdding)}
        >
          ADD
        </button>
      </div>
      <div style={{ padding: "20px" }}>
        {isAdding && (
          <div
            style={{
              padding: "50px",
              background: "#CAF4FF",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "20px",
              }}
            >
              <label style={{ fontWeight: "bold" }}>&ensp;Title</label>
              <input
                style={{ height: "30px", marginTop: "5px" }}
                value={newTaskTitle}
                type="text"
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "3dvh",
                fontSize: "20px",
              }}
            >
              <label style={{ fontWeight: "bold" }}>&ensp;Description</label>
              <input
                style={{ height: "30px", marginTop: "5px" }}
                value={newTaskDescription}
                type="text"
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "30px",
              }}
            >
              <button
                style={{
                  color: "#03001C",
                  textAlign: "center",
                  height: "30px",
                  backgroundColor: "White",
                  padding: "5px 15px 5px 15px",
                  fontSize: "16px",
                  borderRadius: "20px",
                  width: "100px",
                }}
                onClick={addTask}
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="Task_Container" style={{ padding: "15px" }}>
        {tasks.map((task, i) => (
          <TaskCard key={i} task={task} reload={fetchTasks} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;

const TaskCard: FC<{ task: tasks; reload: () => void }> = ({
  task,
  reload,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);
  const [newDescription, setNewDescription] = useState(task.description);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  const handleEdit = async () => {
    await updateTask(task.id, newTitle, newDescription);
    setIsEditing(!isEditing);
    reload();
  };
  const handleDelete = async () => {
    await deleteTask(task.id);
    reload();
  };
  const handleDone = async () => {
    await doneTask(task.id, task.is_completed);
    reload();
  };
  return (
    <div
      style={{
        background: `${task.is_completed ? "#C2FFC7" : "#CAF4FF"}`,
        padding: "10px 40px 20px 40px",
        borderRadius: "20px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div style={{ width: "70%" }}>
        <h2
          style={{
            fontSize: "30px",
            color: "#03001C",
            display: isEditing ? "none" : "block",
          }}
        >
          {task.title}
        </h2>
        <input
          style={{
            fontSize: "30px",
            fontWeight: "bold",
            display: isEditing ? "block" : "none",
            marginTop: "30px",
          }}
          value={newTitle}
          type="text"
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <p
          style={{
            color: "#03001C",
            marginTop: "20px",
            display: isEditing ? "none" : "block",
          }}
        >
          &emsp; {task.description}
        </p>
        <div
          style={{
            display: !isEditing ? "none" : "block",
          }}
        >
          <span
            style={{
              color: "#03001C",
            }}
          >
            &emsp;
          </span>
          <textarea
            style={{
              marginTop: "20px",
              width: "100%",
              height: "100px",
            }}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              style={{
                color: "#03001C",
                textAlign: "center",
                height: "30px",
                backgroundColor: "White",
                padding: "5px 15px 5px 15px",
                fontSize: "16px",
                borderRadius: "20px",
                width: "150px",
              }}
              onClick={handleEdit}
            >
              Finish
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingLeft: "10px",
            color: "#03001C",
          }}
        >
          <p style={{ marginTop: "20px" }}>
            {task.created_at.toUTCString().slice(0, 16)}
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: "20px",
          width: "25%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <button
            style={{
              color: "#03001C",
              textAlign: "center",
              height: "30px",
              backgroundColor: task.is_completed ? "#C2FFC7" : "White",
              padding: "5px 15px 5px 15px",
              fontSize: "16px",
              borderRadius: "20px",
              width: "45%",
            }}
            onClick={() => setIsEditing(!isEditing)}
          >
            EDIT
          </button>
          <button
            style={{
              color: "#03001C",
              textAlign: "center",
              height: "30px",
              backgroundColor: task.is_completed ? "#C2FFC7" : "#FF4545",
              padding: "5px 15px 5px 15px",
              fontSize: "16px",
              borderRadius: "20px",
              width: "45%",
            }}
            onClick={() => setIsConfirmDelete(!isConfirmDelete)}
          >
            DEL
          </button>
        </div>
        {isConfirmDelete && (
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <button
              style={{
                color: "#03001C",
                textAlign: "center",
                height: "30px",
                backgroundColor: task.is_completed ? "#C2FFC7" : "White",
                padding: "5px 15px 5px 15px",
                fontSize: "16px",
                borderRadius: "20px",
                width: "45%",
              }}
              onClick={() => setIsConfirmDelete(!isConfirmDelete)}
            >
              CANCEL
            </button>
            <button
              style={{
                color: "#03001C",
                textAlign: "center",
                height: "30px",
                backgroundColor: task.is_completed ? "#C2FFC7" : "#FF4545",
                padding: "5px 15px 5px 15px",
                fontSize: "16px",
                borderRadius: "20px",
                width: "45%",
              }}
              onClick={handleDelete}
            >
              DELETE
            </button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{
              color: "#03001C",
              textAlign: "center",
              height: "30px",
              backgroundColor: "White",
              padding: "5px 15px 5px 15px",
              fontSize: "16px",
              borderRadius: "20px",
              width: "50%",
            }}
            onClick={handleDone}
          >
            {task.is_completed ? "UNDO" : "DONE"}
          </button>
        </div>
      </div>
    </div>
  );
};
