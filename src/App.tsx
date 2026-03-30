import { Panel } from './components/Layout/Panel.tsx';
import { ProjectPanel } from './components/Panels/ProjectPanel.tsx';
import { SourceMonitor } from './components/Panels/SourceMonitor.tsx';
import { ProgramMonitor } from './components/Panels/ProgramMonitor.tsx';
import { Timeline } from './components/Panels/Timeline.tsx';
import { ToolsBar } from './components/Layout/ToolsBar.tsx';
import { TopHeader } from './components/Layout/TopHeader.tsx';
import { MediaPool } from './components/Panels/MediaPool.tsx';

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopHeader />
      <MediaPool />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <div className="workspace bg-black p-1 gap-1">
          
          {/* Top Left: Source Monitor */}
          <Panel title="Source Monitor" area="area-source">
            <SourceMonitor />
          </Panel>

          {/* Top Right: Program Monitor */}
          <Panel title="Program Monitor" area="area-program">
            <ProgramMonitor />
          </Panel>

          {/* Bottom Left: Project Panel */}
          <Panel title="Project: CinemaPea" area="area-project">
            <ProjectPanel />
          </Panel>

          {/* Bottom Right: Timeline */}
          <div className="area-timeline flex overflow-hidden gap-1">
            <ToolsBar />
            <Panel title="Timeline: Sequence 01" className="flex-1">
              <Timeline />
            </Panel>
          </div>

        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#262626] border-t border-black flex items-center px-4 text-[10px] text-muted-foreground">
        <span>Ready</span>
      </div>
    </div>
  );
}

export default App;
