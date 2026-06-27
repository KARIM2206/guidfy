import { LessonProvider } from "@/app/CONTEXT/LessonProvider";

const RoadmapLayout = ({ children }) => {
  return (
    <LessonProvider>
      <div className="">
        {children}
      </div>
    </LessonProvider>
  );
};

export default RoadmapLayout;