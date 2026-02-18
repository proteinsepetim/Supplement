import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProductCard from "@/components/ProductCard";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupplementWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [showResults, setShowResults] = useState(false);

  const { data: questions = [], isLoading } = trpc.quiz.questions.useQuery();

  const answersArray = useMemo(() =>
    Object.entries(answers).map(([qId, optIds]) => ({
      questionId: Number(qId),
      optionIds: optIds,
    })),
    [answers]
  );

  const { data: recommendations = [], isLoading: loadingRecs } = trpc.quiz.getRecommendations.useQuery(
    { answers: answersArray },
    { enabled: showResults && answersArray.length > 0 }
  );

  const totalSteps = questions.length;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const currentQuestion = questions[currentStep];

  const handleSelectOption = (questionId: number, optionId: number) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.questionType === "single") {
      setAnswers(prev => ({ ...prev, [questionId]: [optionId] }));
    } else {
      setAnswers(prev => {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        }
        return { ...prev, [questionId]: [...current, optionId] };
      });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const currentAnswers = currentQuestion ? (answers[currentQuestion.id] || []) : [];
  const canProceed = currentQuestion ? currentAnswers.length > 0 : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <StoreFooter />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Supplement Sihirbazı</h2>
              <p className="text-muted-foreground">Sihirbaz soruları henüz ayarlanmamış. Lütfen daha sonra tekrar deneyin.</p>
            </CardContent>
          </Card>
        </div>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary/30 text-white py-12 sm:py-16">
          <div className="container text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Supplement Sihirbazı</h1>
            </div>
            <p className="text-white/70 max-w-md mx-auto">
              3 soruda sana özel supplement paketi oluşturalım. Hedefine en uygun ürünleri bul!
            </p>
          </div>
        </div>

        <div className="container py-8 sm:py-12 max-w-2xl mx-auto px-4">
          {!showResults ? (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                  <span>Soru {currentStep + 1} / {totalSteps}</span>
                  <span>%{Math.round(progress)}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">{currentQuestion.questionText}</h2>
                    {currentQuestion.questionType === "multiple" && (
                      <p className="text-sm text-muted-foreground text-center mb-4">Birden fazla seçebilirsiniz</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((option: any) => {
                        const isSelected = currentAnswers.includes(option.id);
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                            className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-200 min-h-[56px] ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <span className={`font-medium ${isSelected ? "text-primary" : ""}`}>{option.optionText}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Geri
                </Button>
                <Button onClick={handleNext} disabled={!canProceed}>
                  {currentStep === totalSteps - 1 ? "Sonuçları Gör" : "İleri"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="text-center mb-8">
                <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">Sana Özel Öneriler</h2>
                <p className="text-muted-foreground">Cevaplarına göre en uygun ürünleri seçtik</p>
              </div>

              {loadingRecs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recommendations.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Kriterlerine uygun ürün bulunamadı. Farklı seçenekler deneyebilirsin.</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-center gap-3 mt-8">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Yeniden Başla
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
