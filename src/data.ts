import { TestFile } from './api/tps-report.ts'
import { Splice, Thread } from './constants.ts'

export const longThread: Thread = {
  toolCommits: {},
  messageOffset: 0,
  focusedFiles: [],
  stateboards: [],
  messages: [
    {
      role: 'system',
      content:
        "You are an expert at goal detection.  Be as brief as possible.\n\nBreak apart the users request into discrete goals, with any dependent goals coming after the goal they depend on.\n\nWork thru these goals one at a time with the user.  Clarify the goal if you are unsure, then call the 'help-finder' function.  This function will return the name of a help file to use to meet that goal.\n\nIf the help reply was 'stuckloop' then apologize for an unimplented feature then exit immediately by way of hari kari.\n\nOnce the name of the help file is returned from the 'help-finder' function, call the 'load' function with the name of the help to get the contents of the help file, that you may examine the help further.  Consider then if this will solve your users current goal and consider the requirements this help needs as context.  If not, converse with the user more until you can make a different call to the 'help-finder'.  Do not apologize and do not mention help files.  Help files are your inner workings and are not to be exposed to the user.  Offer suggestions of what the user might mean, and ask the user to clarify their goal.\n\nIf you think the help file will solve the users problem, then call the 'engage' function with the path to the help file and the text that you want to pass to the help file.  The text is natural language as the help file is being executed by an AI like yourself.  The 'engage' function will execute the help file in a separate branch and then return the result to you.  Be sure to gather as much information from the user that the help file will need before you execute the help file.",
    },
    {
      role: 'user',
      content: 'create a new md file',
    },
    {
      role: 'assistant',
      name: 'test/agent name.md',
      tool_calls: [
        {
          id: 'call_i8C8lqCmSfYzOqYa9YCxDkON',
          type: 'function',
          function: {
            name: 'help-finder',
            arguments: '{"text":"create a new md file"}',
          },
        },
      ],
    },
    {
      role: 'tool',
      tool_call_id: 'call_i8C8lqCmSfYzOqYa9YCxDkON',
      content: 'create-help',
    },
    {
      role: 'assistant',
      name: 'test/agent name.md',
      tool_calls: [
        {
          id: 'call_kShQuzYlpAQenLDbZIcwCgF2',
          type: 'function',
          function: {
            name: 'load',
            arguments: '{"help":"create-help"}',
          },
        },
      ],
    },
    {
      role: 'tool',
      tool_call_id: 'call_kShQuzYlpAQenLDbZIcwCgF2',
      content:
        '{\n  "config": {},\n  "runner": "ai-prompt",\n  "commands": [],\n  "prerequisites": [],\n  "instructions": [\n    "\\nGive it the format of a blank file.\\nTeach it how to write these files out.\\nOnce written, it is automatically picked up by the help-finder.\\nWe should guide the user thru how to run some tests, and show the default tests that are automatically running on it, with the examples being used to test its outputs and expectations.\\n"\n  ],\n  "done": "",\n  "examples": [],\n  "tests": []\n}',
    },
    {
      role: 'assistant',
      name: 'test/agent name.md',
      content:
        'To create a new markdown (md) file, could you please clarify if you need guidance on the markdown syntax for creating specific content or if you are looking to generate a blank md file?',
    },
    {
      role: 'user',
      content: 'just a blank on thanks',
    },
    {
      role: 'assistant',
      name: 'test/agent name.md',
      tool_calls: [
        {
          id: 'call_tmkLJN3yDs63QXkH3imrZlRe',
          type: 'function',
          function: {
            name: 'engage',
            arguments:
              '{"help":"create-help","text":"I need to create a blank markdown file."}',
          },
        },
      ],
    },
    {
      role: 'tool',
      tool_call_id: 'call_tmkLJN3yDs63QXkH3imrZlRe',
      content:
        'Creating a blank Markdown file is a simple process that can be done with any text editor. Here\'s a step-by-step guide on how to create a blank Markdown file:\n\n1. **Open a Text Editor:**\n   Choose a text editor that you are comfortable with. This could be Notepad on Windows, TextEdit on macOS (in plain text mode), or any code editor like Visual Studio Code, Atom, Sublime Text, etc.\n\n2. **Create a New File:**\n   In your text editor, create a new file by going to the File menu and selecting "New" or by using the shortcut (usually `Ctrl + N` on Windows or `Cmd + N` on macOS).\n\n3. **Save the File with a `.md` Extension:**\n   Save the new file with a `.md` extension, which denotes a Markdown file. Go to the File menu and select "Save As." In the dialog box, enter a filename followed by `.md` (for example, `README.md`) and choose the location where you want to save the file. Then click "Save."\n\n4. **Write Markdown Content (Optional):**\n   If you want to add content to your Markdown file, you can start typing using Markdown syntax. Since you want a blank file, you can skip this step.\n\n5. **Close the Text Editor:**\n   If you\'re done with your file, you can close the text editor.\n\nNow you have a blank Markdown file that you can fill with content as needed.\n\nTo test if your Markdown file is working as expected, you can use a Markdown previewer or convert the Markdown to HTML. Many code editors have built-in Markdown previewers. For example, if you\'re using Visual Studio Code, you can open the Command Palette (`Ctrl + Shift + P` or `Cmd + Shift + P`) and type "Markdown preview" to find the option to preview your file.\n\nDefault tests for Markdown files usually involve checking the syntax and rendering of the Markdown content. For example, you might want to ensure that headers, lists, links, images, and code blocks are displaying correctly. You can create a few sample Markdown elements to test this:\n\n```markdown\n# Header 1\n## Header 2\n### Header 3\n\n- List item 1\n- List item 2\n- List item 3\n\n[Link to Google](https://www.google.com)\n\n![Alt text for an image](https://via.placeholder.com/150)\n\n`Inline code` with backticks\n\n```python\n# Code block with syntax highlighting\ndef hello_world():\n    print("Hello, world!")\n```\n```\n\nPreview the file in your editor or use an online Markdown editor to see how these elements are rendered. If they look correct, your Markdown file is working as expected.',
    },
    {
      role: 'assistant',

      name: 'test/agent name.md',
      content:
        'You now have the instructions on how to create a blank Markdown file. If you have any additional questions or need further assistance, feel free to ask.',
    },
  ],
}
export const blankThread: Thread = { ...longThread, messages: [] }
export const shortThread: Thread = {
  ...longThread,
  messages: longThread.messages.slice(0, 3),
}
export const mermaidThread: Thread = {
  ...shortThread,
  messages: [
    shortThread.messages[0],
    {
      role: 'user',
      content:
        'this is a mermaid diagram\n```mermaid\ngraph TD\n  A[Hard edge] -->|Link text| B(Round edge)\n  B --> C{Decision}\n  C -->|One| D[Result one]\n  C -->|Two| E[Result two]\n```',
    },
    {
      role: 'assistant',
      name: 'test/agent name.md',
      content:
        'this is another mermaid diagram\n```mermaid\nsequenceDiagram\n  participant Alice\n  participant Bob\n  Alice->>John: Hello John, how are you?\n  loop Healthcheck\n    John->>John: Fight against hypochondria\n  end\n  Note right of John: Rational thoughts <br/>prevail...\n  John-->>Alice: Great!\n  John->>Bob: How about you?\n  Bob-->>John: Jolly good!',
    },
    {
      role: 'user',
      content:
        'this is a mermaid ER diagram\n```mermaid\nerDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  CUSTOMER }|..|{ DELIVERY-ADDRESS : uses\n```',
    },
  ],
}
export const mermaidErrorThread: Thread = {
  ...mermaidThread,
  messages: [
    shortThread.messages[0],
    {
      role: 'user',
      content:
        'this is a mermaid diagram\n```mermaid\ngraphdgsdf TD\n  A[Hard edge] -->|Link text| B(Round edge)\n  B --> C{Decision}\n  C -->|One| D[Result one]\n  C -->|Two| E[Result two]\n```',
    },
    {
      role: 'user',
      content:
        'this is a mermaid ER diagram\n```mermaid\nerDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n  CUSTOMER }|..|{ DELIVERY-ADDRESS : uses\n```',
    },
    {
      role: 'user',
      content:
        'this is a mermaid diagram\n```mermaid\ngraphdsdf TD\n  A[Hard edge] -->|Link text| B(Round edge)\n  B --> C{Decision}\n  C -->|One| D[Result one]\n  C -->|Two| E[Result two]\n```',
    },
  ],
}
export const splice: Splice = {
  pid: {
    repoId: 'test',
    account: 'test',
    repository: 'test',
    branches: ['main'],
  },
  oid: '8b604959489d020d2a63d7f497e2a519aa244db9',
  /**
   * The commit this splice refers to
   */
  commit: {
    author: {
      name: 'test',
      email: 'test@test.com',
      timestamp: 1625760000,
      timezoneOffset: 0,
    },
    committer: {
      name: 'test',
      email: 'test@test.com',
      timestamp: 1625760000,
      timezoneOffset: 0,
    },
    message: 'test',
    tree: 'test',
    parent: [],
  },
  timestamp: 1625760000,
  changes: {},
}
export const shortBackchat: Thread = {
  ...shortThread,
}

export const tpsReport: TestFile = {
  summary: {
    timestamp: 1724633441398,
    elapsed: 8437,
    iterations: 1,
    completed: 1,
    hash: '65ea5741533a7611bb6f2c413f8ad765d0e488e7',
    path: 'tests/fixtures/test-file-runner.test.md',
    agent: 'agents/hamr.md',
    assessor: 'agents/test-assessor.md',
  },
  cases: [
    {
      summary: {
        timestamp: 1724633442824,
        elapsed: 7011,
        iterations: 1,
        completed: 1,
        prompts: [['list all customers']],
        expectations: [
          '10 customers listed',
          'it is short',
          'purely informational, with no instructions, prompts, or questions at the end',
          'No suggesting or asking for further actions or clarifications',
        ],
        successes: [0, 0, 0, 0],
        name: 'Starter for 10',
      },
      iterations: [
        {
          commit: 'e654a67c20574ef4258542145b0769064388ca1e',
          prompts: ['list all customers'],
          outcomes: [
            {
              reasoning: [
                'The response failed to provide a list of customers as requested, indicating a lack of recognition of straightforward queries for customer data.',
                "The system prompt's complexity and multiple conditions may have led to the AI's inability to deliver the requested information succinctly.",
                'The instruction to not return a description of thinking could prevent the AI from clarifying any ambiguities effectively.',
              ],
              outcome: false,
              analysis: [
                'The system prompt is overly complex and details numerous constraints on various roles, which could distract from the primary task of listing customers.',
                'The refusal to show customers may be influenced by misinterpreting the request as requiring modification or more specific data rather than a simple list.',
              ],
              improvements: [
                'Simplify the prompt by removing redundant instructions.',
                'Make explicit the expectation for the AI to list customers in direct response to such queries without additional qualifiers.',
                'Clarify that certain system capabilities can yield straightforward responses like customer lists without intricate permissions involved.',
              ],
            },
            {
              reasoning: [
                "The agent response was indirect and unclear as it did not directly list customers but instead asked for further clarification, failing to meet the user's straightforward request to list all customers.",
                "The system prompt's verbosity and multiple rules may have caused the agent to hedge its response rather than providing the requested information succinctly.",
              ],
              outcome: false,
              analysis: [
                "The system prompt was excessively detailed and created a barrier to generating direct responses, likely contributing to the agent's unclear reply.",
                'There was no explicit instruction for providing a customer list, which led the agent to refuse the request.',
              ],
              improvements: [
                'Simplify the prompt to focus more explicitly on direct responses to user queries without asking for clarifications unless necessary.',
                'Ensure the prompt includes clear guidance on how to respond to requests for listing entities, possibly providing an example of direct listing.',
              ],
            },
            {
              reasoning: [
                'The response requested a specific action (displaying a list of all customers) but instead provided a refusal, indicating an inability to fulfill the request directly.',
                'The system prompt did not explicitly convey that the assistant should provide information based on the request without conditions or limitations, leading to an incomplete response.',
              ],
              outcome: false,
              analysis: [
                'The system prompt permits the assistant to refuse certain requests if they require a specific action or event, which is what occurred here.',
                'The response should have been purely informational and provided a summary of customers or clarified the nature of the request instead of deflecting it.',
              ],
              improvements: [
                'Revise the system prompt to stress that the assistant should provide requested information directly when it is publicly available or accessible without requiring a specific query.',
                'Remove unnecessarily restrictive language that implies the assistant can refuse based on the nature of information requests, thus maintaining an emphasis on providing comprehensive responses.',
              ],
            },
            {
              reasoning: [
                'The response provided an inability to directly list all customers due to a presumed need for a specific query or event, which contradicts the expectation to refrain from suggesting further actions.',
                'The system prompt did include a directive to follow certain permissions, however, it did not clearly align with the simple task of listing customers.',
                'The inclusion of a suggestion to let the assistant know about specific customers or to update details indicates a deviation from the expectation to avoid further inquiries.',
              ],
              outcome: false,
              analysis: [
                "The prompt has multiple layers of instructions that may cause confusion regarding the assistant's capabilities.",
                'Explicit instructions could guide the assistant more directly regarding simple information requests without additional clarifications.',
                'Simplifying the instructions to focus solely on the task of data output instead of suggesting further actions would comply better with the user prompt.',
              ],
              improvements: [
                'Remove any instructions in the prompt that allow or encourage asking for clarifications.',
                'Make the system prompt more concise, focusing strictly on responding to queries without suggesting actions.',
                "Reiterate that the bot's role is to provide information directly from the CRM without additional prompting.",
              ],
            },
          ],
        },
      ],
    },
  ],
}
