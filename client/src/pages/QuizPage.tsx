/*
 * QuizPage - Supplement Sihirbazı (Quiz Funnel)
 * 3-4 soruluk interaktif bot, sonuçta kişiselleştirilmiş ürün paketi
 */
import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Zap, ArrowRight, ArrowLeft, ShoppingCart, RotateCcw } from 'lucide-react';
import { products } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Answer = {
  gender: string;
  goal: string;
  frequency: string;
  budget: string;
};

const QUESTIONS = [
  {
    id: 'gender',
    title: 'Cinsiyetiniz nedir?',
    subtitle: 'Size en uygun ürünleri belirlemek için',
    options: [
      { value: 'male', label: 'Erkek', emoji: '🏋️‍♂️' },
      { value: 'female', label: 'Kadın', emoji: '🏋️‍♀️' },
    ],
  },
  {
    id: 'goal',
    title: 'Hedefiniz nedir?',
    subtitle: 'Birincil fitness hedefinizi seçin',
    options: [
      { value: 'muscle', label: 'Kas Yapmak', emoji: '💪' },
      { value: 'fat-loss', label: 'Yağ Yakmak', emoji: '🔥' },
      { value: 'endurance', label: 'Dayanıklılık', emoji: '🏃' },
      { value: 'health', label: 'Genel Sağlık', emoji: '❤️' },
    ],
  },
  {
    id: 'frequency',
    title: 'Haftada kaç gün spor yapıyorsunuz?',
    subtitle: 'Antrenman yoğunluğunuza göre öneri yapacağız',
    options: [
      { value: '1-2', label: '1-2 Gün', emoji: '🌱' },
      { value: '3-4', label: '3-4 Gün', emoji: '⚡' },
      { value: '5-6', label: '5-6 Gün', emoji: '🔥' },
      { value: '7', label: 'Her Gün', emoji: '🏆' },
    ],
  },
  {
    id: 'budget',
    title: 'Aylık bütçeniz ne kadar?',
    subtitle: 'Bütçenize uygun en iyi paketi oluşturalım',
    options: [
      { value: 'low', label: '500-1000 TL', emoji: '💰' },
      { value: 'medium', label: '1000-2000 TL', emoji: '💰💰' },
      { value: 'high', label: '2000+ TL', emoji: '💰💰💰' },
    ],
  },
];

function getRecommendations(answers: Answer) {
  const recommended = [];

  // Protein
  const proteinProducts = products.filter(p => p.category === 'protein-tozu');
  if (answers.goal === 'muscle') {
    recommended.push(proteinProducts.find(p => p.slug.includes('whey')) || proteinProducts[0]);
  } else if (answers.goal === 'fat-loss') {
    recommended.push(proteinProducts.find(p => p.slug.includes('isolate') || p.slug.includes('iso')) || proteinProducts[0]);
  } else {
    recommended.push(proteinProducts[0]);
  }

  // Kreatin (for muscle/endurance)
  if (answers.goal === 'muscle' || answers.goal === 'endurance') {
    const creatinProducts = products.filter(p => p.category === 'kreatin');
    if (creatinProducts.length > 0) recommended.push(creatinProducts[0]);
  }

  // Vitamin
  const vitaminProducts = products.filter(p => p.category === 'vitamin-mineral');
  if (vitaminProducts.length > 0) recommended.push(vitaminProducts[0]);

  // Amino for heavy trainers
  if (answers.frequency === '5-6' || answers.frequency === '7') {
    const aminoProducts = products.filter(p => p.category === 'amino-asit');
    if (aminoProducts.length > 0) recommended.push(aminoProducts[0]);
  }

  return recommended.filter(Boolean).slice(0, 4);
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answer>>({});
  const [showResults, setShowResults] = useState(false);
  const { addItem } = useCart();

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const recommendations = showResults ? getRecommendations(answers as Answer) : [];
  const totalPrice = recommendations.reduce((s, p) => s + (p?.variants[0]?.price || 0), 0);
  const discountedPrice = Math.round(totalPrice * 0.85);

  const handleAddAll = () => {
    recommendations.forEach(product => {
      if (product) {
        const variant = product.variants.find(v => v.stock > 0) || product.variants[0];
        addItem(product, variant);
      }
    });
    toast.success('Tüm önerilen ürünler sepete eklendi!');
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  };

  return (
    <div>
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#FF6B35]">Anasayfa</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#1B2A4A] font-medium">Supplement Sihirbazı</span>
          </nav>
        </div>
      </div>

      <div className="container py-8 max-w-2xl mx-auto">
        {!showResults ? (
          <div>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Soru {step + 1} / {QUESTIONS.length}</span>
                <span className="text-sm font-semibold text-[#FF6B35]">%{Math.round(progress)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div animate={{ width: `${progress}%` }} className="bg-[#FF6B35] h-2 rounded-full" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-[#FF6B35]" />
                  </div>
                  <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">{currentQuestion.title}</h1>
                  <p className="text-gray-500 text-sm mt-1">{currentQuestion.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map(option => (
                    <button key={option.value} onClick={() => handleAnswer(option.value)}
                      className={`p-5 rounded-xl border-2 text-left transition-all hover:border-[#FF6B35] hover:shadow-md ${
                        answers[currentQuestion.id as keyof Answer] === option.value
                          ? 'border-[#FF6B35] bg-orange-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                      <span className="text-3xl block mb-2">{option.emoji}</span>
                      <span className="font-heading font-semibold text-[#1B2A4A]">{option.label}</span>
                    </button>
                  ))}
                </div>

                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6B35] mt-6 mx-auto">
                    <ArrowLeft className="w-4 h-4" /> Önceki Soru
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-[#1B2A4A]">Senin İçin İdeal Paket!</h1>
              <p className="text-gray-500 text-sm mt-1">Hedeflerine ve antrenman düzenine göre özel seçildi</p>
            </div>

            <div className="space-y-3 mb-6">
              {recommendations.map((product, i) => product && (
                <div key={product.id} className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4">
                  <span className="w-8 h-8 bg-[#FF6B35] text-white rounded-lg flex items-center justify-center font-heading font-bold text-sm shrink-0">{i + 1}</span>
                  <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm text-[#1B2A4A] truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.variants[0].weight}</p>
                  </div>
                  <span className="font-heading font-bold text-[#1B2A4A] whitespace-nowrap">{product.variants[0].price.toLocaleString('tr-TR')} TL</span>
                </div>
              ))}
            </div>

            {/* Package Deal */}
            <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5c] rounded-xl p-6 text-white text-center mb-6">
              <p className="text-sm text-gray-300">Paketi birlikte alın</p>
              <div className="flex items-center justify-center gap-3 mt-2">
                <span className="text-lg text-gray-400 line-through">{totalPrice.toLocaleString('tr-TR')} TL</span>
                <span className="font-heading font-black text-3xl text-[#FF6B35]">{discountedPrice.toLocaleString('tr-TR')} TL</span>
              </div>
              <p className="text-xs text-green-400 mt-1 font-medium">%15 paket indirimi uygulandı!</p>
              <button onClick={handleAddAll}
                className="mt-4 bg-[#FF6B35] text-white px-8 py-3 rounded-lg font-heading font-bold text-sm hover:bg-orange-600 transition-colors inline-flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Tümünü Sepete Ekle
              </button>
            </div>

            <button onClick={reset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6B35] mx-auto">
              <RotateCcw className="w-4 h-4" /> Testi Tekrarla
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
