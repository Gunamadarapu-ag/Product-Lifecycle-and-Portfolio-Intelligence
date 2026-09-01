/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Task model and seed data for the Task Tracker.
 *
 * Split out of `TrackerTab.tsx` so `App` can seed its task state without
 * eagerly importing the tracker component — which would defeat the lazy
 * chunk boundary around tab 11.
 */

export interface Task {
  id: string;
  tags: string[];
  title: string;
  duration: string;
  progress?: string;
  dueDate: string;
  avatars: string[];
  alertType?: 'red-alarm' | 'exclamation';
  isCompleted?: boolean;
  comments?: number;
  subtasks?: number;
  isNew?: boolean;
  createdAt?: number;
}

export const DEFAULT_TASKS: Record<string, Task[]> = {
  pmo: [
    { id: 'pmo-1', tags: ['Design'], title: 'Network Design Implementation Design', duration: '52.25 days', progress: '42%', dueDate: '05/17', avatars: ['JO', 'AM'] },
    { id: 'pmo-2', tags: ['Deployment'], title: 'Install New Product in Corporate Data Centers and Go-Live', duration: '5 days', dueDate: '06/03/2025', avatars: ['JI'], alertType: 'red-alarm' },
    { id: 'pmo-3', tags: ['Scope'], title: 'Complete Post Implementation Survey', duration: '4 days', dueDate: '06/11/2025', avatars: ['JO'] },
    { id: 'pmo-4', tags: ['Development'], title: 'Complete Project Closure Checklist', duration: '7 days', dueDate: '06/05/2025', avatars: ['AM', 'JI'], alertType: 'exclamation' },
    { id: 'pmo-5', tags: ['Design'], title: 'Cutover Ph 2 Users and Monitor', duration: '5 days', dueDate: '06/10/2025', avatars: ['JO'] }
  ],
  it: [
    { id: 'it-1', tags: ['Testing'], title: 'Test Plan complete', duration: '0 days', dueDate: '07/31', avatars: ['AM'] },
    { id: 'it-2', tags: ['Development'], title: 'Modify code', duration: '10 days', dueDate: '03/25/2025', avatars: ['AM', 'JI'] },
    { id: 'it-3', tags: ['Design'], title: 'Re-test modified code', duration: '10 days', dueDate: '04/08/2025', avatars: ['JI'] }
  ],
  marketing: [
    { id: 'mkt-1', tags: ['Testing'], title: 'Test component modules to product specifications', duration: '20 days', dueDate: '01/15/2025', avatars: ['JO'] },
    { id: 'mkt-2', tags: ['Development'], title: 'Develop Product and System Test Plans based on product specifications.', duration: '13 days', dueDate: '07/31', avatars: ['AM'] },
    { id: 'mkt-3', tags: ['Development'], title: 'Re-test modified code', duration: '7 days', dueDate: '02/11/2025', avatars: [] },
    { id: 'mkt-4', tags: ['Design'], title: 'Create Mockup based on Network Design Implementation Definition and Design', duration: '40.75 days', dueDate: '07/12', avatars: ['JI', 'JO', 'AM'] }
  ],
  sales: [
    { id: 'sls-1', tags: ['Testing'], title: 'Test module integration', duration: '20 days', dueDate: '03/11/2025', avatars: ['JI', 'AM'], comments: 2, subtasks: 2 },
    { id: 'sls-2', tags: ['Scope'], title: 'Communication Error Communication', duration: '25 days', dueDate: '11/20', avatars: ['AM', 'JO'] },
    { id: 'sls-3', tags: ['Scope'], title: 'Pilot complete', duration: '0 days', dueDate: '05/13/2025', avatars: [] },
    { id: 'sls-4', tags: ['Scope', 'Design'], title: 'List of pilot users delivered from corporate to the team', duration: '0 days', dueDate: '02/11/2025', avatars: ['JO'] },
    { id: 'sls-5', tags: ['Deployment'], title: 'Finalize Project Closure report', duration: '3 days', dueDate: '05/20/2025', avatars: ['AM'] }
  ],
  engineering: [
    { id: 'eng-1', tags: ['Development'], title: 'Evaluate testing information', duration: '5 days', dueDate: '05/13/2025', avatars: ['AM', 'JI'] },
    { id: 'eng-2', tags: ['Testing'], title: 'Conduct Pilot User Testing', duration: '10 days', dueDate: '04/22/2025', avatars: ['JO'] },
    { id: 'eng-3', tags: ['Analysis'], title: 'Summarize activities required to move product into production', duration: '10 days', dueDate: '05/20/2025', avatars: ['JI'] },
    { id: 'eng-4', tags: ['Scope'], title: 'Close Network Connection Exchange', duration: '15 days', dueDate: '09/27', avatars: ['JI', 'JO', 'AM'], alertType: 'exclamation' },
    { id: 'eng-5', tags: ['Analysis'], title: 'Network Protocol Communication Exchange testing', duration: '5 days', dueDate: '09/30', avatars: ['JO'] }
  ],
  sustainability: [
    { id: 'sus-1', tags: ['Analysis'], title: 'Conduct product lifecycle carbon footprint assessment', duration: '14 days', dueDate: '06/20/2025', avatars: ['JI'] },
    { id: 'sus-2', tags: ['Design'], title: 'Assess biodegradable packaging replacement options', duration: '10 days', dueDate: '07/15/2025', avatars: ['AM'] }
  ],
  finance: [
    { id: 'fin-1', tags: ['Analysis'], title: 'Audit annual category margin projection model', duration: '8 days', dueDate: '05/30/2025', avatars: ['JO'] },
    { id: 'fin-2', tags: ['Scope'], title: 'Calculate post-rationalisation write-off savings', duration: '5 days', dueDate: '06/05/2025', avatars: ['AM'] }
  ],
  procurement: [
    { id: 'pro-1', tags: ['Development'], title: 'Draft supplier notice letter for Sunset SKUs', duration: '4 days', dueDate: '05/22/2025', avatars: ['JI'] },
    { id: 'pro-2', tags: ['Testing'], title: 'Verify alternative co-packer capacity runways', duration: '12 days', dueDate: '06/18/2025', avatars: ['JO'] }
  ],
  qa: [
    { id: 'qa-1', tags: ['Testing'], title: 'Execute formula stability testing for reformulated variants', duration: '30 days', dueDate: '08/01/2025', avatars: ['JI'] },
    { id: 'qa-2', tags: ['Analysis'], title: 'Verify label allergen statements compliance audit', duration: '5 days', dueDate: '05/28/2025', avatars: ['AM'] }
  ],
  rd: [
    { id: 'rd-1', tags: ['Design'], title: 'Finalise ingredient substitution specifications report', duration: '15 days', dueDate: '06/10/2025', avatars: ['AM', 'JI'] },
    { id: 'rd-2', tags: ['Development'], title: 'Create prototype packaging formats mockups', duration: '20 days', dueDate: '07/05/2025', avatars: ['JO'] }
  ],
  consumer: [
    { id: 'con-1', tags: ['Analysis'], title: 'Analyze post-rationalization focus group feedback', duration: '7 days', dueDate: '05/25/2025', avatars: ['JO'] },
    { id: 'con-2', tags: ['Scope'], title: 'Verify customer brand loyalty transition mapping data', duration: '10 days', dueDate: '06/12/2025', avatars: ['JI'] }
  ]
};
