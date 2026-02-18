import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Edit, GripVertical, Sparkles } from "lucide-react";

export default function QuizManager() {
  const utils = trpc.useUtils();
  const { data: questions = [], isLoading } = trpc.admin.quiz.questions.useQuery();
  const { data: categories = [] } = trpc.admin.categories.list.useQuery();

  const [newQuestion, setNewQuestion] = useState({ questionText: "", questionType: "single" as "single" | "multiple", sortOrder: 0 });
  const [newOption, setNewOption] = useState({ questionId: 0, optionText: "", optionIcon: "", categoryIds: [] as number[], sortOrder: 0 });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  const createQuestion = trpc.admin.quiz.createQuestion.useMutation({
    onSuccess: () => { utils.admin.quiz.questions.invalidate(); toast.success("Soru eklendi"); setShowQuestionDialog(false); setNewQuestion({ questionText: "", questionType: "single", sortOrder: 0 }); },
    onError: (err) => toast.error(err.message),
  });
  const updateQuestion = trpc.admin.quiz.updateQuestion.useMutation({
    onSuccess: () => { utils.admin.quiz.questions.invalidate(); toast.success("Soru güncellendi"); },
    onError: (err) => toast.error(err.message),
  });
  const deleteQuestion = trpc.admin.quiz.deleteQuestion.useMutation({
    onSuccess: () => { utils.admin.quiz.questions.invalidate(); toast.success("Soru silindi"); },
    onError: (err) => toast.error(err.message),
  });
  const createOption = trpc.admin.quiz.createOption.useMutation({
    onSuccess: () => { utils.admin.quiz.questions.invalidate(); toast.success("Seçenek eklendi"); setShowOptionDialog(false); setNewOption({ questionId: 0, optionText: "", optionIcon: "", categoryIds: [], sortOrder: 0 }); },
    onError: (err) => toast.error(err.message),
  });
  const deleteOption = trpc.admin.quiz.deleteOption.useMutation({
    onSuccess: () => { utils.admin.quiz.questions.invalidate(); toast.success("Seçenek silindi"); },
    onError: (err) => toast.error(err.message),
  });

  const toggleCategoryId = (catId: number) => {
    setNewOption(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId) ? prev.categoryIds.filter(id => id !== catId) : [...prev.categoryIds, catId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="h-6 w-6" /> Supplement Sihirbazı</h1>
          <p className="text-muted-foreground">Quiz sorularını ve seçeneklerini yönetin</p>
        </div>
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Soru Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Yeni Soru Ekle</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Soru Metni</Label>
                <Input value={newQuestion.questionText} onChange={e => setNewQuestion(p => ({ ...p, questionText: e.target.value }))} placeholder="Hedefiniz nedir?" />
              </div>
              <div>
                <Label>Soru Tipi</Label>
                <Select value={newQuestion.questionType} onValueChange={(v: "single" | "multiple") => setNewQuestion(p => ({ ...p, questionType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Tek Seçim</SelectItem>
                    <SelectItem value="multiple">Çoklu Seçim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sıralama</Label>
                <Input type="number" value={newQuestion.sortOrder} onChange={e => setNewQuestion(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
              </div>
              <Button className="w-full" onClick={() => createQuestion.mutate(newQuestion)} disabled={!newQuestion.questionText || createQuestion.isPending}>
                {createQuestion.isPending ? "Ekleniyor..." : "Soru Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Henüz soru yok</h3>
            <p className="text-muted-foreground mb-4">Supplement Sihirbazı için sorular ekleyin</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question: any, idx: number) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{idx + 1}. {question.questionText}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{question.questionType === "single" ? "Tek Seçim" : "Çoklu Seçim"}</Badge>
                        <Badge variant={question.isActive ? "default" : "secondary"} className="text-xs">{question.isActive ? "Aktif" : "Pasif"}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.isActive}
                      onCheckedChange={(checked) => updateQuestion.mutate({ id: question.id, isActive: checked })}
                    />
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                      if (confirm("Bu soruyu ve tüm seçeneklerini silmek istediğinize emin misiniz?")) deleteQuestion.mutate({ id: question.id });
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options?.map((option: any) => {
                    const catIds = (option.categoryIds as number[] | null) || [];
                    const catNames = catIds.map(id => categories.find((c: any) => c.id === id)?.name).filter(Boolean);
                    return (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="font-medium text-sm">{option.optionText}</span>
                          {catNames.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {catNames.map((name: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => {
                          if (confirm("Bu seçeneği silmek istediğinize emin misiniz?")) deleteOption.mutate({ id: option.id });
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Add option */}
                <Dialog open={showOptionDialog && editingQuestionId === question.id} onOpenChange={(open) => { setShowOptionDialog(open); if (open) setEditingQuestionId(question.id); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => { setEditingQuestionId(question.id); setNewOption(p => ({ ...p, questionId: question.id })); }}>
                      <Plus className="h-3 w-3 mr-1" /> Seçenek Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Seçenek Ekle</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Seçenek Metni</Label>
                        <Input value={newOption.optionText} onChange={e => setNewOption(p => ({ ...p, optionText: e.target.value }))} placeholder="Kas kazanmak" />
                      </div>
                      <div>
                        <Label>Yönlendirilecek Kategoriler</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {categories.map((cat: any) => (
                            <Badge
                              key={cat.id}
                              variant={newOption.categoryIds.includes(cat.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleCategoryId(cat.id)}
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Sıralama</Label>
                        <Input type="number" value={newOption.sortOrder} onChange={e => setNewOption(p => ({ ...p, sortOrder: Number(e.target.value) }))} />
                      </div>
                      <Button className="w-full" onClick={() => createOption.mutate({ ...newOption, questionId: question.id })} disabled={!newOption.optionText || createOption.isPending}>
                        {createOption.isPending ? "Ekleniyor..." : "Seçenek Ekle"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
