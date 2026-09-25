import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ROUTINE_ACTIVITIES, STEPS_CONFIG, validateRoutineSequence } from './config';
import './RoutineRecall.css';

/**
 * Shuffles an array randomly using Fisher-Yates
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Synthesizes gentle audio tones via standard Web Audio API (zero external library)
 */
function playAudioFeedback(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    if (type === 'snap') {
      // Pleasant light click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      // Cheerful ascending arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } else if (type === 'error') {
      // Gentle soft boing
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Ignore audio context errors if browser blocked auto-audio
  }
}

export default function RoutineRecall() {
  // Shuffled activities list in the tray
  const [trayActivities, setTrayActivities] = useState([]);

  // Placements map: { [stepNumber: 1..5]: activityId }
  const [placements, setPlacements] = useState({});

  // Active interaction states
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [dragOverStep, setDragOverStep] = useState(null);
  const [dragOverTray, setDragOverTray] = useState(false);

  // Mobile Touch drag ghost state
  const [touchGhost, setTouchGhost] = useState(null);
  const touchDragRef = useRef(null); // { activityId, sourceStep, startX, startY, hasMoved }

  // Status & validation states
  const [feedback, setFeedback] = useState(null); // { type: 'error', message: string }
  const [errorSteps, setErrorSteps] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // SVG Arrow lines dynamically measured
  const [arrowLines, setArrowLines] = useState([]);
  const diagramRef = useRef(null);
  const stepBoxRefs = useRef({});

  // Helper to look up activity by ID
  const getActivity = useCallback(
    (id) => ROUTINE_ACTIVITIES.find((item) => item.id === id) || null,
    []
  );

  /**
   * Resets placements, clears feedback, and shuffles tray
   */
  const resetGame = useCallback(() => {
    setTrayActivities(shuffleArray(ROUTINE_ACTIVITIES));
    setPlacements({});
    setSelectedActivityId(null);
    setDragOverStep(null);
    setDragOverTray(false);
    setFeedback(null);
    setErrorSteps([]);
    setIsSuccess(false);
    setTouchGhost(null);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  /**
   * Recalculates SVG arrow lines connecting Step 1 -> Step 2 -> Step 3 -> Step 4 -> Step 5
   */
  const updateArrowCoordinates = useCallback(() => {
    if (!diagramRef.current) return;
    const containerRect = diagramRef.current.getBoundingClientRect();
    const lines = [];

    for (let step = 1; step <= 4; step++) {
      const currentBox = stepBoxRefs.current[step];
      const nextBox = stepBoxRefs.current[step + 1];

      if (currentBox && nextBox) {
        const r1 = currentBox.getBoundingClientRect();
        const r2 = nextBox.getBoundingClientRect();

        let rawX1, rawY1, rawX2, rawY2;

        if (step % 2 === 1) {
          // Odd step (Left) -> Even step (Right)
          rawX1 = r1.right - containerRect.left;
          rawY1 = r1.top + r1.height / 2 - containerRect.top;
          rawX2 = r2.left - containerRect.left;
          rawY2 = r2.top + r2.height / 2 - containerRect.top;
        } else {
          // Even step (Right) -> Odd step (Left)
          rawX1 = r1.left - containerRect.left;
          rawY1 = r1.top + r1.height / 2 - containerRect.top;
          rawX2 = r2.right - containerRect.left;
          rawY2 = r2.top + r2.height / 2 - containerRect.top;
        }

        // Apply trimming so the arrowhead tip lands cleanly just outside the box border
        const dx = rawX2 - rawX1;
        const dy = rawY2 - rawY1;
        const dist = Math.hypot(dx, dy);

        if (dist > 10) {
          const startTrim = 4;
          const endTrim = 6;
          const x1 = rawX1 + (dx / dist) * startTrim;
          const y1 = rawY1 + (dy / dist) * startTrim;
          const x2 = rawX2 - (dx / dist) * endTrim;
          const y2 = rawY2 - (dy / dist) * endTrim;
          lines.push({ step, x1, y1, x2, y2 });
        }
      }
    }

    if (lines.length > 0) {
      setArrowLines(lines);
    }
  }, []);

  // Update arrows on window resize and container observer
  useEffect(() => {
    updateArrowCoordinates();
    const timer = setTimeout(updateArrowCoordinates, 60);

    let resizeObserver;
    if (diagramRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateArrowCoordinates();
      });
      resizeObserver.observe(diagramRef.current);
    }

    window.addEventListener('resize', updateArrowCoordinates);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateArrowCoordinates);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateArrowCoordinates, trayActivities]);

  /**
   * Validates full sequence when all 5 steps are filled
   */
  const checkSequenceCompletion = (currentPlacements) => {
    const { isComplete, isAllCorrect, errors } = validateRoutineSequence(currentPlacements);

    if (isComplete) {
      if (isAllCorrect) {
        setIsSuccess(true);
        setFeedback(null);
        setErrorSteps([]);
        playAudioFeedback('success');
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'],
          });
        } catch (e) {}
      } else {
        setErrorSteps(errors);
        setFeedback({
          type: 'error',
          message: 'Not quite right, try again!',
        });
        playAudioFeedback('error');
      }
    }
  };

  /**
   * Places, moves, or swaps an activity into a target step
   */
  const handleMoveOrSwapActivity = (activityId, sourceStep, targetStep) => {
    setPlacements((prev) => {
      const next = { ...prev };
      const currentInTarget = next[targetStep];

      if (sourceStep) {
        // Dragged from an existing step
        if (sourceStep === targetStep) {
          return prev; // Dropped on itself
        }
        if (currentInTarget) {
          // Target already has an activity: SWAP them!
          next[sourceStep] = currentInTarget;
          next[targetStep] = activityId;
        } else {
          // Target is empty: move to target
          delete next[sourceStep];
          next[targetStep] = activityId;
        }
      } else {
        // Dragged from tray
        // If this activity was previously somewhere else, clear it
        Object.keys(next).forEach((stepNum) => {
          if (next[stepNum] === activityId) {
            delete next[stepNum];
          }
        });
        // Place in target (replaces any previous item in that target step)
        next[targetStep] = activityId;
      }

      playAudioFeedback('snap');
      checkSequenceCompletion(next);
      return next;
    });

    setSelectedActivityId(null);
    setDragOverStep(null);
    setDragOverTray(false);
    setErrorSteps([]);
    if (feedback?.type === 'error') {
      setFeedback(null);
    }
  };

  /**
   * Removes an activity from a step back to tray
   */
  const removeActivityFromStep = (stepNumber) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[stepNumber];
      return next;
    });
    setFeedback(null);
    setErrorSteps([]);
    playAudioFeedback('snap');
  };

  // ----------------------------------------------------------------------------
  // Desktop HTML5 Drag & Drop Handlers
  // ----------------------------------------------------------------------------
  const handleDragStart = (e, activityId, sourceStep = null) => {
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ activityId, sourceStep })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverStep = (e, stepNumber) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStep !== stepNumber) {
      setDragOverStep(stepNumber);
    }
  };

  const handleDragLeaveStep = (e, stepNumber) => {
    if (dragOverStep === stepNumber) {
      setDragOverStep(null);
    }
  };

  const handleDropOnStep = (e, targetStep) => {
    e.preventDefault();
    setDragOverStep(null);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const parsed = JSON.parse(rawData);
      handleMoveOrSwapActivity(parsed.activityId, parsed.sourceStep, targetStep);
    } catch (err) {
      handleMoveOrSwapActivity(rawData, null, targetStep);
    }
  };

  const handleDragOverTray = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverTray) setDragOverTray(true);
  };

  const handleDragLeaveTray = () => {
    setDragOverTray(false);
  };

  const handleDropOnTray = (e) => {
    e.preventDefault();
    setDragOverTray(false);
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const parsed = JSON.parse(rawData);
      if (parsed.sourceStep) {
        removeActivityFromStep(parsed.sourceStep);
      }
    } catch (err) {}
  };

  // ----------------------------------------------------------------------------
  // Mobile Native Touch Drag & Drop Handlers
  // ----------------------------------------------------------------------------
  const handleTouchStart = (e, activityId, sourceStep = null) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      activityId,
      sourceStep,
      startX: touch.clientX,
      startY: touch.clientY,
      hasMoved: false,
    };
    const activity = getActivity(activityId);
    if (activity) {
      setTouchGhost({
        activity,
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!touchDragRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchDragRef.current.startX;
    const dy = touch.clientY - touchDragRef.current.startY;

    if (Math.hypot(dx, dy) > 8) {
      touchDragRef.current.hasMoved = true;
      if (e.cancelable) e.preventDefault();
    }

    setTouchGhost((prev) => (prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null));

    // Detect element under touch point
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    const stepBox = elem?.closest('.dr-step-box');
    if (stepBox) {
      const stepNum = Number(stepBox.dataset.step);
      setDragOverStep(stepNum);
      setDragOverTray(false);
    } else if (elem?.closest('.dr-tray-container')) {
      setDragOverStep(null);
      setDragOverTray(true);
    } else {
      setDragOverStep(null);
      setDragOverTray(false);
    }
  };

  const handleTouchEnd = (e) => {
    const dragData = touchDragRef.current;
    touchDragRef.current = null;
    setTouchGhost(null);

    const changedTouch = e.changedTouches?.[0];
    if (dragData && dragData.hasMoved && changedTouch) {
      const elem = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
      const stepBox = elem?.closest('.dr-step-box');
      if (stepBox) {
        const targetStep = Number(stepBox.dataset.step);
        handleMoveOrSwapActivity(dragData.activityId, dragData.sourceStep, targetStep);
      } else if (dragData.sourceStep) {
        // Dropped outside or over tray -> remove from step
        removeActivityFromStep(dragData.sourceStep);
      }
    } else if (dragData && !dragData.hasMoved) {
      // It was a tap/click!
      if (dragData.sourceStep) {
        removeActivityFromStep(dragData.sourceStep);
      } else {
        handleActivityClick(dragData.activityId);
      }
    }

    setDragOverStep(null);
    setDragOverTray(false);
  };

  // ----------------------------------------------------------------------------
  // Accessible Tap-to-Place Handlers
  // ----------------------------------------------------------------------------
  const handleActivityClick = (activityId) => {
    setSelectedActivityId((prev) => (prev === activityId ? null : activityId));
  };

  const handleStepClick = (stepNumber) => {
    if (selectedActivityId) {
      handleMoveOrSwapActivity(selectedActivityId, null, stepNumber);
    } else if (placements[stepNumber]) {
      removeActivityFromStep(stepNumber);
    }
  };

  // Group the 5 tray items across the 3 rows:
  // Row 1 (top): 2 items
  // Row 2 (middle): 1 item (centered)
  // Row 3 (bottom): 2 items
  const rowTopItems = trayActivities.slice(0, 2);
  const rowMiddleItems = trayActivities.slice(2, 3);
  const rowBottomItems = trayActivities.slice(3, 5);

  const placedCount = Object.keys(placements).length;

  return (
    <div className="dr-component-root">
      {/* Soft Cream Card Container (#FAF3E8) */}
      <div className="dr-card">
        {/* Header */}
          <header className="dr-header">
            <h1 className="dr-title">
              <span className="dr-bell-icon" role="img" aria-label="bell">
                🔔
              </span>
              Daily routine Recall
            </h1>
            <hr className="dr-divider" />
          </header>

          {/* Sequence Diagram (Zigzag 5 Steps with Connecting Arrows) */}
          <div className="dr-diagram-container" ref={diagramRef}>
            {/* SVG Connecting Diagonal Arrows */}
            <svg className="dr-arrows-svg">
              <defs>
                <marker
                  id="dr-arrowhead"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1A1A1A" />
                </marker>
              </defs>
              {arrowLines.map(({ step, x1, y1, x2, y2 }) => (
                <line
                  key={step}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="dr-arrow-line"
                  markerEnd="url(#dr-arrowhead)"
                />
              ))}
            </svg>

            {/* 5 Zigzag Step Boxes */}
            {STEPS_CONFIG.map(({ stepNumber, label }) => {
              const placedActivityId = placements[stepNumber];
              const placedActivity = placedActivityId ? getActivity(placedActivityId) : null;
              const isDragHover = dragOverStep === stepNumber;
              const isError = errorSteps.includes(stepNumber);

              return (
                <div
                  key={stepNumber}
                  data-step={stepNumber}
                  ref={(el) => (stepBoxRefs.current[stepNumber] = el)}
                  className={`dr-step-box dr-step-${stepNumber} ${
                    placedActivity ? 'dr-filled' : ''
                  } ${isDragHover ? 'dr-drag-hover' : ''} ${isError ? 'dr-step-error' : ''}`}
                  draggable={Boolean(placedActivity)}
                  onDragStart={(e) =>
                    placedActivity && handleDragStart(e, placedActivity.id, stepNumber)
                  }
                  onDragOver={(e) => handleDragOverStep(e, stepNumber)}
                  onDragLeave={(e) => handleDragLeaveStep(e, stepNumber)}
                  onDrop={(e) => handleDropOnStep(e, stepNumber)}
                  onTouchStart={(e) =>
                    placedActivity && handleTouchStart(e, placedActivity.id, stepNumber)
                  }
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  onClick={() => handleStepClick(stepNumber)}
                  title={
                    placedActivity
                      ? 'Drag or tap to remove or swap'
                      : 'Drop or tap an activity here'
                  }
                  role="button"
                  tabIndex={0}
                >
                  {placedActivity ? (
                    <div className="dr-step-filled-content">
                      <span className="dr-step-filled-icon">{placedActivity.icon}</span>
                      <span className="dr-step-filled-label">{placedActivity.label}</span>
                    </div>
                  ) : (
                    <span className="dr-step-placeholder">{label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Activity Tray Section (Bordered Rounded Container) */}
          <div
            className={`dr-tray-container ${dragOverTray ? 'dr-tray-hover' : ''}`}
            aria-label="Activity Tray"
            onDragOver={handleDragOverTray}
            onDragLeave={handleDragLeaveTray}
            onDrop={handleDropOnTray}
          >
            {/* Top Row: 2 items */}
            <div className="dr-tray-row-top">
              {rowTopItems.map((activity) => {
                const isPlaced = Object.values(placements).includes(activity.id);
                const isSelected = selectedActivityId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className={`dr-activity-item ${isPlaced ? 'dr-placed' : ''} ${
                      isSelected ? 'dr-selected' : ''
                    }`}
                    draggable={!isPlaced}
                    onDragStart={(e) => handleDragStart(e, activity.id, null)}
                    onTouchStart={(e) => !isPlaced && handleTouchStart(e, activity.id, null)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onClick={() => !isPlaced && handleActivityClick(activity.id)}
                    title={isPlaced ? 'Already placed in sequence' : 'Drag or tap to place'}
                  >
                    <span className="dr-activity-icon">{activity.icon}</span>
                    <span className="dr-activity-label">{activity.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Middle Row: 1 item (centered) */}
            <div className="dr-tray-row-middle">
              {rowMiddleItems.map((activity) => {
                const isPlaced = Object.values(placements).includes(activity.id);
                const isSelected = selectedActivityId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className={`dr-activity-item ${isPlaced ? 'dr-placed' : ''} ${
                      isSelected ? 'dr-selected' : ''
                    }`}
                    draggable={!isPlaced}
                    onDragStart={(e) => handleDragStart(e, activity.id, null)}
                    onTouchStart={(e) => !isPlaced && handleTouchStart(e, activity.id, null)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onClick={() => !isPlaced && handleActivityClick(activity.id)}
                    title={isPlaced ? 'Already placed in sequence' : 'Drag or tap to place'}
                  >
                    <span className="dr-activity-icon">{activity.icon}</span>
                    <span className="dr-activity-label">{activity.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: 2 items */}
            <div className="dr-tray-row-bottom">
              {rowBottomItems.map((activity) => {
                const isPlaced = Object.values(placements).includes(activity.id);
                const isSelected = selectedActivityId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className={`dr-activity-item ${isPlaced ? 'dr-placed' : ''} ${
                      isSelected ? 'dr-selected' : ''
                    }`}
                    draggable={!isPlaced}
                    onDragStart={(e) => handleDragStart(e, activity.id, null)}
                    onTouchStart={(e) => !isPlaced && handleTouchStart(e, activity.id, null)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    onClick={() => !isPlaced && handleActivityClick(activity.id)}
                    title={isPlaced ? 'Already placed in sequence' : 'Drag or tap to place'}
                  >
                    <span className="dr-activity-icon">{activity.icon}</span>
                    <span className="dr-activity-label">{activity.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls Bar: Reset & Placed Count */}
          <div className="dr-controls-bar">
            <button
              className="dr-btn-reset"
              onClick={resetGame}
              title="Reset placements and reshuffle"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
            <span className="dr-progress-text">{placedCount} / 5 placed</span>
          </div>

          {/* Gentle Error / Retry Banner */}
          {feedback && feedback.type === 'error' && (
            <div className="dr-feedback-banner dr-error">
              <AlertCircle size={16} />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Celebratory Success Modal */}
          {isSuccess && (
            <div className="dr-modal-overlay" role="dialog" aria-modal="true">
              <div className="dr-modal-icon">
                <CheckCircle2 size={38} />
              </div>
              <h2 className="dr-modal-title">Routine recalled successfully!</h2>
              <p className="dr-modal-subtitle">
                Great job ordering your morning to evening daily sequence!
              </p>
              <button className="dr-btn-play-again" onClick={resetGame}>
                Play Again
              </button>
            </div>
          )}
        </div>

      {/* Floating Touch-Drag Ghost Element (Mobile) */}
      {touchGhost && (
        <div
          className="dr-touch-ghost"
          style={{
            left: `${touchGhost.x}px`,
            top: `${touchGhost.y}px`,
          }}
        >
          <span className="dr-ghost-icon">{touchGhost.activity.icon}</span>
          <span className="dr-ghost-label">{touchGhost.activity.label}</span>
        </div>
      )}
    </div>
  );
}
