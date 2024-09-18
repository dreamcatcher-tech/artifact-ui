import { CommitGraph } from '@dreamcatcher-tech/commit-graph/src/index.ts'
import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import Debug from 'debug'
const log = Debug('AI:ArtifactCommitGraph')

const ArtifactCommitGraph: FC<WidgetProps> = ({ api }) => {
  log('ArtifactCommitGraph', api)

  // the api has a target / scoped PID

  const commits = threeBranches
  const branchHeads = [
    {
      name: 'main',
      commit: {
        sha: 'bgpqkjvf2mqoi9lq4upamdj0ke7e8iuo',
      },
    },
    {
      name: 'feature-branch',
      commit: {
        sha: 'bgpv9t0smfear03um03737mrkggb84o2',
      },
    },
    {
      name: 'another-branch',
      commit: {
        sha: 'r26g8v5vo7c82c5o1tt9hcleef924tp2',
      },
    },
  ]
  const selected = [
    'bgpqkjvf2mqoi9lq4upamdj0ke7e8iuo',
    'r26g8v5vo7c82c5o1tt9hcleef924tp2',
  ]
  const graphStyle = {
    commitSpacing: 60,
    branchSpacing: 20,
    nodeRadius: 3,
    branchColors: [
      '#010A40',
      '#FC42C9',
      '#3D91F0',
      '#29E3C1',
      '#C5A15A',
      '#FA7978',
      '#5D6280',
      '#5AC58D',
      '#5C5AC5',
      '#EB7340',
    ],
  }

  return (
    <CommitGraph
      commits={commits}
      branchHeads={branchHeads}
      graphStyle={graphStyle}
      onClick={(commit, event) => {
        console.log('onClick', commit, event)
      }}
      selected={selected}
    />
  )
}

export default ArtifactCommitGraph

const threeBranches = [
  {
    sha: 'bgpqkjvf2mqoi9lq4upamdj0ke7e8iuo',

    commit: {
      author: {
        name: 'liuliu',
        date: 1681858752000,
      },
      message: 'tablename updated with data from tablename_map.csv',
    },

    parents: [{ sha: 'usb7m2d8ovpsffj2akjt8ik82dqtv91k' }],
  },
  {
    sha: 'usb7m2d8ovpsffj2akjt8ik82dqtv91k',

    commit: {
      author: {
        name: 'liuliu',
        date: 1676576657000,
      },
      message: 'Merge pull request #5 from another-branch',
    },

    parents: [
      { sha: 'srhkmbpv19uq6vpemek6hpr9hori8tl5' },
      { sha: 'r26g8v5vo7c82c5o1tt9hcleef924tp2' },
    ],
  },
  {
    sha: 'srhkmbpv19uq6vpemek6hpr9hori8tl5',

    commit: {
      author: {
        name: 'liuliu',
        date: 1675299220000,
      },
      message: 'Run SQL query: INSERT INTO `test` (`id`) VALUES (885506521)',
    },

    parents: [{ sha: '8f4lkggoeq239mgtti0vsbsgujdjkmb7' }],
  },
  {
    sha: '8f4lkggoeq239mgtti0vsbsgujdjkmb7',

    commit: {
      author: {
        name: 'liuliu',
        date: 1675299214000,
      },
      message: 'Merge pull request #8 from  feature-branch',
    },

    parents: [
      { sha: 'ns725d8noah3m0mjjvrilet1rsmcgna2' },
      { sha: 'bgpv9t0smfear03um03737mrkggb84o2' },
    ],
  },
  {
    sha: 'ns725d8noah3m0mjjvrilet1rsmcgna2',

    commit: {
      author: {
        name: 'liuliu',
        date: 1674780307000,
      },
      message:
        'Run SQL query: INSERT INTO `changePrimaryKey` (`pk`, `pk2`, `col1`) VALUES (401562027, 521579361, "Macintosh Snapchat Macintosh HTML Oracle this not have dock exit not mp3 Adobe this")',
    },

    parents: [{ sha: '6higvr7ic9ndahfruh3kufu409im44jd' }],
  },
  {
    sha: '6higvr7ic9ndahfruh3kufu409im44jd',

    commit: {
      author: {
        name: 'liuliu',
        date: 1670880887000,
      },
      message: 'changePrimaryKey updated with data from editor.csv',
    },

    parents: [{ sha: 'son1fouu8sf01ae969ues924kqgeqni5' }],
  },
  {
    sha: 'son1fouu8sf01ae969ues924kqgeqni5',

    commit: {
      author: {
        name: 'liuliu',
        date: 1670879386000,
      },
      message: 'keylesstable updated with data from editor.csv',
    },

    parents: [{ sha: '41bjn4aq9gcv606ikspam44j0lj74kmf' }],
  },
  {
    sha: '41bjn4aq9gcv606ikspam44j0lj74kmf',
    commit: {
      author: {
        name: 'liuliu',
        date: 1670879320000,
      },
      message: 'keylesstable updated with data from editor.csv',
    },

    parents: [{ sha: 'hfpejf60airsgcmu3giv39rvn5i4lq8g' }],
  },
  {
    sha: 'hfpejf60airsgcmu3giv39rvn5i4lq8g',
    commit: {
      author: {
        name: 'liuliu',
        date: 1670879248000,
      },
      message:
        'Run SQL query: CREATE TABLE keylesstable (\n  col1 VARCHAR(255),\n   col2 VARCHAR(255),\n    col3 VARCHAR(255)\n);',
    },

    parents: [{ sha: '3cfrdsa12gba2g72ufuccq2evlqnianf' }],
  },
  {
    sha: 'bgpv9t0smfear03um03737mrkggb84o2',

    commit: {
      author: {
        name: 'liuliu',
        date: 1667953430000,
      },
      message:
        'tablename replaced with data from liuliu_empty_main_fake_sql_table_name.csv',
    },

    parents: [{ sha: '3cfrdsa12gba2g72ufuccq2evlqnianf' }],
  },
  {
    sha: '3cfrdsa12gba2g72ufuccq2evlqnianf',

    commit: {
      author: {
        name: 'liuliu',
        date: 1667861730000,
      },
      message:
        'Run SQL query: CREATE TABLE changePrimaryKey (\n  pk INT,\n  pk2 Int,\n  col1 VARCHAR(255),\n  PRIMARY KEY (pk,pk2)\n);',
    },

    parents: [{ sha: 'g8f0n0rgqnevnu1a4bi3mosbac33h4kd' }],
  },
  {
    sha: 'g8f0n0rgqnevnu1a4bi3mosbac33h4kd',

    commit: {
      author: {
        name: 'liuliu',
        date: 1667851615000,
      },
      message:
        'Run SQL query: INSERT INTO `tablename` (`pk`, `col1`, `col2`) VALUES (205504495, "phishing with is hacker not qwerty we not cliff a cookie dock WeChat WhatsApp 0-day database 0-day rollback", "venture")',
    },

    parents: [{ sha: '7vbn8f66bak5aqsjdvggdft0pr016han' }],
  },
  {
    sha: 'r26g8v5vo7c82c5o1tt9hcleef924tp2',

    commit: {
      author: {
        name: 'liuliu',
        date: 1667427422000,
      },
      message:
        'Run SQL query: INSERT INTO `tablename` (`pk`, `col1`, `col2`) VALUES (1944258597, "read-only LAN SAAS diff not cliff cache fat32 ATX that rooting Airbnb and MVP monetize emulator with", "traction")',
    },

    parents: [{ sha: '7vbn8f66bak5aqsjdvggdft0pr016han' }],
  },
  {
    sha: '7vbn8f66bak5aqsjdvggdft0pr016han',
    commit: {
      author: {
        name: 'liuliu',
        date: 1667423884000,
      },
      message:
        'Run SQL query: INSERT INTO `tablename` (`pk`, `col1`, `col2`) VALUES (608335284, "of but SEO driver emulator to daemon clone a we query android to Apple the gif ramen MVP wumpus", "query")',
    },

    parents: [{ sha: 'oafuq1kfti8jt5uvj0n7eq2cnc6gl282' }],
  },
  {
    sha: 'oafuq1kfti8jt5uvj0n7eq2cnc6gl282',
    commit: {
      author: {
        name: 'liuliu',
        date: 1663719708000,
      },
      message:
        'Run SQL query: UPDATE `tablename` SET `col2` = "Lorem Ipsum is \n\nsimply dummy texts of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n\n It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." WHERE `pk` = "1518697666"',
    },
    parents: [{ sha: 'g2ut7a6p7ij9luvi9207jihre375ecqp' }],
  },
  {
    sha: 'g2ut7a6p7ij9luvi9207jihre375ecqp',
    commit: {
      author: {
        name: 'tbantle',
        date: 1633465794000,
      },
      message: 'Initialize data repository',
    },
    parents: [],
  },
]
