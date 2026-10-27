import { describe, expect, it } from "vitest";
import { project, profile } from "@/lib/profile";

describe("portfolio links", () => {
  it("uses the official barbershop address for Ver projeto", () => {
    expect(project.demoUrl).toBe("https://barbearia-do-valter.lovable.app");
  });
  it("uses the real WhatsApp number", () => {
    expect(profile.whatsapp).toBe("https://wa.me/5519988415107");
  });
});
