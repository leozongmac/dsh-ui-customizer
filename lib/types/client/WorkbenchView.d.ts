import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { T } from './SettingsSection.tsx';
/** Props: the conversation-view runtime kit plus the injected translate. */
export type WorkbenchViewProps = PropsRuntime<'conversation.view'> & {
    t: T;
};
/** The workbench tab content. */
export declare function WorkbenchView({ t }: WorkbenchViewProps): import("react").JSX.Element;
//# sourceMappingURL=WorkbenchView.d.ts.map