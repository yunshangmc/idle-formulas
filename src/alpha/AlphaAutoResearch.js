import { getGlobalMultiplier } from "../savestate";
import { reverseGeometric } from "../utilities";
import { researchDictonary } from "./AlphaResearchTab";

const checkAutoResearch = (state, updateState) => {
  if (state.mailsCompleted["Research"] === undefined) return;
  if (!state.alphaUpgrades.AURE) return;
  for (const research of Object.values(researchDictonary)) {
    if (!state) return;
    const startTime = state.researchStartTime[research.id];
    const deltaMilliSeconds = startTime ? Date.now() - startTime : 0;
    const researchLevel = state.researchLevel[research.id];
    if (researchLevel === undefined) return;
    const progressMultiplier =
      getGlobalMultiplier(state) * research.getMultiplier(state);
    const progress = (progressMultiplier * deltaMilliSeconds) / 1000;
    const goal =
      research.durationStart *
      Math.pow(research.durationBase, researchLevel || 0);
    const percentage = Math.min(
      deltaMilliSeconds / research.minimumDuration,
      progress / goal
    );
    const isDone = !researchLevel || percentage >= 1;
    const oneSecondBulk = isDone
      ? reverseGeometric(1, research.durationBase, progressMultiplier / goal)
      : 0; //Theoretical Research Levels in 1 Second
    const adjustedBulk =
      oneSecondBulk > getGlobalMultiplier(state)
        ? Math.pow(oneSecondBulk / getGlobalMultiplier(state), 0.3) *
          getGlobalMultiplier(state)
        : oneSecondBulk;
    const leftToMaxx = 2500 - (researchLevel || 0);
    const bulkAmount = isDone
      ? Math.min(leftToMaxx, Math.floor(adjustedBulk))
      : 0;
    if (!research.checkUnlock(state)) return;
    if (isDone) {
      updateState({
        name: "startResearch",
        research: research,
        bulkAmount: Math.max(bulkAmount, 1),
      });
    }
  }
};

export const StartAutoResearch = (state, updateState) => {
  return setInterval(() => checkAutoResearch(state, updateState), 200);
};
