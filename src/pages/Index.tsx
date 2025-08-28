import { PotionMaster } from '../components/PotionMaster';
import { ThemeBackground } from '../components/ThemeBackground';

const Index = () => {
  return (
    <div className="relative min-h-screen">
      <ThemeBackground />
      <div className="relative z-10">
        <PotionMaster />
      </div>
    </div>
  );
};

export default Index;
