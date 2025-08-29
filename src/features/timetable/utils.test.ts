import { describe, expect, it } from "vitest";
import { buildRegistrationMap } from "./utils";
import type { RegistrationWithRelations } from "./types";

describe("buildRegistrationMap", () => {
  it("空の配列で空のMapを返す", () => {
    const result = buildRegistrationMap([]);
    expect(result.size).toBe(0);
  });

  it("講義スケジュールを正しくマッピングする", () => {
    const mockRegistrations: RegistrationWithRelations[] = [
      {
        id: "reg1",
        userId: "user1",
        lectureId: "lec1",
        termId: 1,
        customName: null,
        customColor: null,
        customRoom: null,
        customInstructor: null,
        attendanceCount: 0,
        absenceCount: 0,
        lateCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lecture: {
          id: "lec1",
          name: "プログラミング基礎",
          syllabusCode: "CS101",
          instructor: "山田太郎",
          room: "A101",
          schedules: [
            { day: 1, time: 1 }, // 月曜1限
            { day: 3, time: 2 }, // 水曜2限
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const result = buildRegistrationMap(mockRegistrations);
    
    // 月曜1限のキー: (1-1) * 5 + 1 = 0 * 5 + 1 = 1
    expect(result.has(1)).toBe(true);
    expect(result.get(1)?.id).toBe("reg1");
    
    // 水曜2限のキー: (3-1) * 5 + 2 = 2 * 5 + 2 = 12
    expect(result.has(12)).toBe(true);
    expect(result.get(12)?.id).toBe("reg1");
  });

  it("複数の登録を正しく処理する", () => {
    const mockRegistrations: RegistrationWithRelations[] = [
      {
        id: "reg1",
        userId: "user1",
        lectureId: "lec1",
        termId: 1,
        customName: null,
        customColor: null,
        customRoom: null,
        customInstructor: null,
        attendanceCount: 0,
        absenceCount: 0,
        lateCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lecture: {
          id: "lec1",
          name: "数学",
          syllabusCode: "MATH101",
          instructor: "鈴木",
          room: "B201",
          schedules: [{ day: 2, time: 3 }], // 火曜3限
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "reg2",
        userId: "user1",
        lectureId: "lec2",
        termId: 1,
        customName: null,
        customColor: null,
        customRoom: null,
        customInstructor: null,
        attendanceCount: 0,
        absenceCount: 0,
        lateCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lecture: {
          id: "lec2",
          name: "英語",
          syllabusCode: "ENG101",
          instructor: "田中",
          room: "C301",
          schedules: [{ day: 4, time: 1 }], // 木曜1限
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const result = buildRegistrationMap(mockRegistrations);
    
    // 火曜3限のキー: (2-1) * 5 + 3 = 1 * 5 + 3 = 8
    expect(result.get(8)?.lecture?.name).toBe("数学");
    
    // 木曜1限のキー: (4-1) * 5 + 1 = 3 * 5 + 1 = 16
    expect(result.get(16)?.lecture?.name).toBe("英語");
    
    expect(result.size).toBe(2);
  });

  it("スケジュールがない講義を無視する", () => {
    const mockRegistrations: RegistrationWithRelations[] = [
      {
        id: "reg1",
        userId: "user1",
        lectureId: "lec1",
        termId: 1,
        customName: null,
        customColor: null,
        customRoom: null,
        customInstructor: null,
        attendanceCount: 0,
        absenceCount: 0,
        lateCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lecture: {
          id: "lec1",
          name: "特別講義",
          syllabusCode: "SP101",
          instructor: "佐藤",
          room: "D401",
          schedules: [], // 空のスケジュール
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const result = buildRegistrationMap(mockRegistrations);
    expect(result.size).toBe(0);
  });

  it("lectureがnullの場合を正しく処理する", () => {
    const mockRegistrations: any[] = [
      {
        id: "reg1",
        userId: "user1",
        lectureId: "lec1",
        termId: 1,
        lecture: null, // lectureがnull
      },
    ];

    const result = buildRegistrationMap(mockRegistrations);
    expect(result.size).toBe(0);
  });
});