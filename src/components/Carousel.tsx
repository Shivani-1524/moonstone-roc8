import React, {useState, useCallback, useEffect} from 'react';
import {CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";


const Carousel = () => {

    const offerList = ["Get 10% off on business sign up", "Get 50% off on first purchase", "Get free gifts on first purchase"]
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const changeTimer = 3000

    const handleCarouselClick = (type : string) => {
        if(type === "PREVIOUS"){
            setCurrentOfferIndex((prevIndex) =>
            prevIndex === 0 ? offerList.length - 1 : prevIndex - 1
          );
        }else{
            goToNextSlide();
        }
        resetTimer();
      }

      const goToNextSlide = useCallback(() => {
        setCurrentOfferIndex(prevIndex => (prevIndex + 1) % offerList.length);
      }, []);

      const resetTimer = useCallback(() => {
        if(timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(goToNextSlide, changeTimer);
      }, [goToNextSlide]);

      useEffect(() => {
        timerRef.current = setInterval(goToNextSlide, changeTimer);
        return () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        };
      }, [goToNextSlide]);


  return (
    <div className="flex bg-light-grey h-36 gap-5 justify-center items-center">
          <CaretLeft className='cursor-pointer' size={10} onClick={()=>handleCarouselClick("PREVIOUS")} />
             <div style={{width: "214px"}}><p className="text-sm text-center font-medium">{offerList[currentOfferIndex]}</p></div>
          <CaretRight className='cursor-pointer'  onClick={()=>handleCarouselClick("NEXT")} size={10} />
        </div>
  )
}

export default Carousel