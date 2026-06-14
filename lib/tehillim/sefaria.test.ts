import { describe, expect, it } from "vitest";

import { normalizeSefariaText } from "./sefaria";

describe("normalizeSefariaText", () => {
  it("converts Sefaria Hebrew markup into plain text", () => {
    expect(
      normalizeSefariaText(
        'אַ֥שְֽׁרֵי<span class="mam-implicit-maqaf">־</span>הָאִ֗ישׁ אֲשֶׁ֤ר&thinsp;<b>׀</b> לֹ֥א',
      ),
    ).toBe("אַ֥שְֽׁרֵי־הָאִ֗ישׁ אֲשֶׁ֤ר ׀ לֹ֥א");
  });

  it("preserves Sefaria poetry breaks as text line breaks", () => {
    expect(
      normalizeSefariaText(
        '<span class="poetry indentAll">Happy is the one</span><br><span class="poetry indentAllDouble">or taken the path</span>',
      ),
    ).toBe("Happy is the one\nor taken the path");
  });
});
