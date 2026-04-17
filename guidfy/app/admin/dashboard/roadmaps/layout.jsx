import { LessonProvider } from "@/app/CONTEXT/LessonProvider";
import { RoadmapProvider } from "@/app/CONTEXT/RoadmapProvider";
import { StepProvider } from "@/app/CONTEXT/StepProvider";

const RoadmapLayout = ({ children }) => {
  return (
    <RoadmapProvider>
      <StepProvider>
        <LessonProvider>
        <div className="">
          {children}
        </div>
        </LessonProvider>
      </StepProvider>
    </RoadmapProvider>
  );
};

export default RoadmapLayout;