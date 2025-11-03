import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { CentralManager } from "../../src/core/central-manager.js";
import { fs } from "../../src/utils/fs.js";
import path from "path";
import os from "os";

describe("CentralManager", () => {
  let testDir: string;
  let manager: CentralManager;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `sync-workflow-test-${Date.now()}`);
    manager = new CentralManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    if (await fs.exists(testDir)) {
      await fs.remove(testDir);
    }
  });

  describe("init", () => {
    test("should create workflows directory", async () => {
      await manager.init();

      expect(await fs.exists(manager.getWorkflowsPath())).toBe(true);
    });
  });

  describe("isInitialized", () => {
    test("should return false when not initialized", async () => {
      expect(await manager.isInitialized()).toBe(false);
    });

    test("should return true when initialized", async () => {
      await manager.init();
      expect(await manager.isInitialized()).toBe(true);
    });
  });

  describe("scanWorkflows", () => {
    test("should scan all markdown files", async () => {
      await manager.init();

      const workflowsPath = manager.getWorkflowsPath();
      await fs.writeFile(
        path.join(workflowsPath, "test1.md"),
        "# Test 1",
        "utf-8"
      );
      await fs.writeFile(
        path.join(workflowsPath, "test2.md"),
        "# Test 2",
        "utf-8"
      );
      await fs.writeFile(
        path.join(workflowsPath, "readme.txt"),
        "Not a workflow",
        "utf-8"
      );

      const workflows = await manager.scanWorkflows();
      expect(workflows.length).toBe(2);
      expect(workflows.map((w) => w.name)).toEqual(["test1.md", "test2.md"]);
    });

    test("should return empty array for empty directory", async () => {
      await manager.init();
      const workflows = await manager.scanWorkflows();
      expect(workflows).toEqual([]);
    });
  });

  describe("getWorkflow", () => {
    test("should get specific workflow file", async () => {
      await manager.init();

      const workflowsPath = manager.getWorkflowsPath();
      await fs.writeFile(
        path.join(workflowsPath, "test.md"),
        "# Test Content",
        "utf-8"
      );

      const workflow = await manager.getWorkflow("test.md");
      expect(workflow).not.toBeNull();
      expect(workflow?.name).toBe("test.md");
      expect(workflow?.content).toBe("# Test Content");
    });

    test("should return null for non-existent file", async () => {
      await manager.init();
      const workflow = await manager.getWorkflow("nonexistent.md");
      expect(workflow).toBeNull();
    });
  });
});
