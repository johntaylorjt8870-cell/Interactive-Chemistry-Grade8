import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { getSubjectDefinition } from '@/data/curriculum/registry'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'

// Frozen before the closing-review edits. These files must not be edited to
// implement new Lesson 2 figures; the renderer and extra tab also stay intact.
const protectedHashes: Record<string, string> = {
  "src/data/curriculum/chemistryLesson1.ts": "f218608560132104242a72f9de351c67cb4d0248454310dd0df56c0dc418ee4a",
  "src/data/curriculum/chemistryLesson1Book.ts": "672a92ae9f72eedac0b8203701707d9e1a58182f515799d37d9745e9465294e4",
  "src/data/curriculum/chemistryLesson1Notebook.ts": "204efff291370e8aba5eab5c251c28ca702627923099b9799294b2ba2271cf0e",
  "src/data/curriculum/chemistryLesson1Practice.ts": "9be1ff194f049f942e0a0d0cb4bbb46906d0b62a504fea5c2f71b2ca1450934b",
  "src/data/curriculum/chemistryLesson1TeacherGuide.ts": "038b5ff22edd4bc2b02dfc692c895e71f617216c70230f551c4cd981dd8b56fa",
  "src/data/curriculum/chemistryLesson1Test.ts": "95731cab9099035f6c9a2b0a42e1d46ce9cfaceded42b9ca2dd53a925f450eab",
  "src/data/curriculum/chemistryLesson2Extra.ts": "33a0826df9eb9c5207637c02ba04c069709272173228901081de8917de3fbbe3",
  "src/data/curriculum/chemistryLesson3.ts": "712e7f00d553881945bc533865ae00d9577107bf33b1baab35488b78a050c3d4",
  "src/data/curriculum/chemistryLesson3Book.ts": "e2015c8e30173cec469d685b85efce78c9d6d120f04eab2b745cc296a02f2ce6",
  "src/data/curriculum/chemistryLesson3Notebook.ts": "1848cebdaf3676445c2af98041bd10658224577865a1f342c3f99a2b559b158d",
  "src/data/curriculum/chemistryLesson3Practice.ts": "d770c863a7fd5d99443b6ae83ca88582fd87e15dd39e8381dbea1d8d3231742e",
  "src/data/curriculum/chemistryLesson3TeacherGuide.ts": "c89243ee2778cd5b744775787c3bd5f0ccae0591b6de3086a5a5866bc86a0ff0",
  "src/data/curriculum/chemistryLesson3Test.ts": "310c63c427dec76d300f8cb4ba5ddda1a1f9de95bc9dc5fbd6fe3c9bfc68c83b",
  "src/data/curriculum/chemistryLesson4.ts": "0f5a9fae3a8950d7a41431a47b17dfc8e947e9598615765568409817deb7a668",
  "src/data/curriculum/chemistryLesson4Book.ts": "322ecf36e68f6f80d71b4cf35f10c1c16fe309d90a067bb93694390d67e577ad",
  "src/data/curriculum/chemistryLesson4Notebook.ts": "c4fc8acf548e149df1822f54a56dda844acfcfccfe39c30655678b9a4082160d",
  "src/data/curriculum/chemistryLesson4Practice.ts": "3417c775a0b9f38cdd8f1ac9b64d8bb7f9d3c114de91b1126aea1a3f5c4c5638",
  "src/data/curriculum/chemistryLesson4TeacherGuide.ts": "e3fc1184d481d4d0cf55f42a344c583609602e2f82b89347146b9e751f81abd4",
  "src/data/curriculum/chemistryLesson4Test.ts": "de47dea0caad504413426aa0973a29df691592a30c7728ce2417a76c94aec360",
  "src/data/curriculum/chemistryLesson5.ts": "88a6106e404a2519a240f8bfd62a5580b78ad38b8ba99dc6a9794868e12e77d7",
  "src/data/curriculum/chemistryLesson5Book.ts": "614ae636149f826a1d6c755601ea0f90f75ac9f30e123c16c6dce98fb08c6f3c",
  "src/data/curriculum/chemistryLesson5Notebook.ts": "ac8ebca1ebcf4451ddd7ba67e52f1fc6eb227193bdac407385a9d8bf08ee0072",
  "src/data/curriculum/chemistryLesson5Practice.ts": "a42173e3dbd90cf259493aa1cc32b63dde9a38f5a3e9339ae67037bbc1b667b4",
  "src/data/curriculum/chemistryLesson5Questions.ts": "ee3341a083339015abd79bf01b79134d27da95c4327357ef50467a1ec8f12d7b",
  "src/data/curriculum/chemistryLesson5TeacherGuide.ts": "8556c1f508a44ee5f35e4bb079a1e4164f88b653185edaa936d338c4e09762fb",
  "src/data/curriculum/chemistryLesson5Test.ts": "4da54b3c618a7df3f06d7fc5dcf71acd9cc110a117003bd80458cd72dc01a185",
  "src/data/curriculum/chemistryLesson6.ts": "cb6d16b99689694fe1361d83c66037bf2f458745d0f3ee6bef4aa53739efecd6",
  "src/data/curriculum/chemistryLesson6Book.ts": "f31e603ae6bba2ee9cb129d3142e5752e75fe3829753ea43b3b25eaf270fff38",
  "src/data/curriculum/chemistryLesson6Notebook.ts": "677b3616be4d16a4a121d781170928df9a140998b8329016901fbffec6dad17a",
  "src/data/curriculum/chemistryLesson6Practice.ts": "a3a69fa2ecfec89b4ece77f93c933a56929ca4f704e85ada7b78138aa4f069aa",
  "src/data/curriculum/chemistryLesson6TeacherGuide.ts": "09adf1b36f2ca6ff6423c7c123b09587e958f81afb4a4142310023e42e695edb",
  "src/data/curriculum/chemistryLesson6Test.ts": "553f82f1a3a582684b8b6550233e6691f2f32359d24a0bd5d5fb5bf753c28add",
  "src/data/curriculum/chemistryLesson7.ts": "8fef73a76145f4ae7a57b7531c5a2b305d35adecbd4975f05bed8abc6c2872ec",
  "src/data/curriculum/chemistryLesson7Book.ts": "d784973c7d327fa5d0cb226d7f085e39dcd5432d30b9995ef8e03dc20495064c",
  "src/data/curriculum/chemistryLesson7Practice.ts": "6c9005aee811966cc4b646f9aed02bc927fba412d2e085db1c8b0bafacc306ad",
  "src/data/curriculum/chemistryLesson7TeacherGuide.ts": "46181fd9978a5a357865d41af5885399ef137875eef100112f89db319fc2d584",
  "src/data/curriculum/chemistryLesson7Test.ts": "3ff3d883a94ce148d7daf67ceff0a084b764c8c4f3cf13e1a4ab953aa7b361be",
  "src/lessons/LessonFlow.tsx": "95bb8bd36795426865835096f873c007070be04887eae7f2f988395ea4e17dd7",
  "src/lessons/StudentNotebookView.tsx": "4efa1689ea26f2ceda64166be6081467a8a65529e4ccf33fc08157a0cd4d10ed",
  "src/lessons/notebookStaticFigures.tsx": "dfae7e6c21747b184505a8df8773bbca0d1c529885eba1c6956f0e38d213dbe6"
}

describe('Lesson 2 closing changes — cross-lesson isolation', () => {
  it('preserves protected curriculum files, extra, LessonFlow and the shared renderer byte for byte', () => {
    for (const [path, hash] of Object.entries(protectedHashes)) {
      expect(createHash('sha256').update(readFileSync(path)).digest('hex'), path).toBe(hash)
    }
  })
  const lessons = getSubjectDefinition('chemistry').units.flatMap(u => u.lessons).filter(l => l.id !== 'chem-u1-l2')
  it.each(lessons)('does not activate Lesson 2 figures or tools or mutate data in $id', lesson => {
    const before = JSON.stringify(lesson)
    if (lesson.studentNotebook) {
      const html = renderToStaticMarkup(<StudentNotebookView notebook={lesson.studentNotebook}/>)
      expect(html).not.toContain('l2-notebook-static')
      expect(html).not.toContain('l2-notebook-tool')
      expect(html).not.toContain('data-research-lewis')
    }
    expect(lesson.extra).toBeUndefined()
    expect(JSON.stringify(lesson)).toBe(before)
  })
})
