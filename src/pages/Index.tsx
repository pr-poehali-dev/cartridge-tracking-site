import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: 'cartridge' | 'equipment' | 'supplies';
  quantity: number;
  description?: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('warehouse');
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'HP LaserJet 1020', category: 'equipment', quantity: 3, description: 'Лазерный принтер' },
    { id: '2', name: 'Картридж HP CE285A', category: 'cartridge', quantity: 12, description: 'Черный картридж' },
    { id: '3', name: 'Бумага А4', category: 'supplies', quantity: 500, description: 'Офисная бумага' },
    { id: '4', name: 'Canon PIXMA G3420', category: 'equipment', quantity: 2, description: 'Струйный принтер' },
    { id: '5', name: 'Картридж Canon PG-46', category: 'cartridge', quantity: 8, description: 'Черный картридж Canon' }
  ]);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'cartridge',
    quantity: 0,
    description: ''
  });

  const [issueForm, setIssueForm] = useState({
    itemId: '',
    quantity: 0,
    recipient: ''
  });

  const handleLogin = () => {
    if (password === 'admin') {
      setIsAuthenticated(true);
      toast({ title: 'Вход выполнен', description: 'Добро пожаловать в систему учета!' });
    } else {
      toast({ title: 'Ошибка входа', description: 'Неверный пароль', variant: 'destructive' });
    }
  };

  const addItem = () => {
    if (!newItem.name || newItem.quantity <= 0) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }
    
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString()
    };
    
    setInventory([...inventory, item]);
    setNewItem({ name: '', category: 'cartridge', quantity: 0, description: '' });
    toast({ title: 'Добавлено', description: `${item.name} добавлен на склад` });
  };

  const issueItem = () => {
    if (!issueForm.itemId || !issueForm.recipient || issueForm.quantity <= 0) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    const item = inventory.find(i => i.id === issueForm.itemId);
    if (!item || item.quantity < issueForm.quantity) {
      toast({ title: 'Ошибка', description: 'Недостаточно товара на складе', variant: 'destructive' });
      return;
    }

    setInventory(inventory.map(i => 
      i.id === issueForm.itemId 
        ? { ...i, quantity: i.quantity - issueForm.quantity }
        : i
    ));

    setIssueForm({ itemId: '', quantity: 0, recipient: '' });
    toast({ title: 'Выдано', description: `${item.name} выдан сотруднику ${issueForm.recipient}` });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cartridge': return 'Printer';
      case 'equipment': return 'Monitor';
      case 'supplies': return 'Package';
      default: return 'Box';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'cartridge': return 'Картридж';
      case 'equipment': return 'Оборудование';
      case 'supplies': return 'Расходники';
      default: return 'Прочее';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Icon name="Lock" size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Система Учета</CardTitle>
            <CardDescription>Введите пароль для доступа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Введите пароль"
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={16} className="mr-2" />
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Система Учета Оборудования</h1>
            <p className="text-gray-600 mt-1">Управление расходными материалами и оборудованием</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="warehouse" className="flex items-center gap-2">
              <Icon name="Warehouse" size={16} />
              Склад
            </TabsTrigger>
            <TabsTrigger value="issue" className="flex items-center gap-2">
              <Icon name="ArrowRight" size={16} />
              Выдача
            </TabsTrigger>
            <TabsTrigger value="receipt" className="flex items-center gap-2">
              <Icon name="Plus" size={16} />
              Поступление
            </TabsTrigger>
          </TabsList>

          <TabsContent value="warehouse" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon name={getCategoryIcon(item.category)} size={24} className="text-primary" />
                      <Badge variant={item.quantity > 5 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}>
                        {item.quantity} шт
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon name="Tag" size={14} />
                      {getCategoryLabel(item.category)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {inventory.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Icon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Склад пуст</h3>
                  <p className="text-gray-600">Добавьте первый товар через раздел "Поступление"</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ArrowRight" size={20} />
                  Выдача материалов
                </CardTitle>
                <CardDescription>Оформите выдачу оборудования или расходных материалов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="item-select">Выберите товар</Label>
                    <Select onValueChange={(value) => setIssueForm({...issueForm, itemId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.filter(item => item.quantity > 0).map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} (в наличии: {item.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Количество</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={issueForm.quantity || ''}
                      onChange={(e) => setIssueForm({...issueForm, quantity: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient">Получатель</Label>
                  <Input
                    id="recipient"
                    value={issueForm.recipient}
                    onChange={(e) => setIssueForm({...issueForm, recipient: e.target.value})}
                    placeholder="ФИО сотрудника"
                  />
                </div>
                
                <Button onClick={issueItem} className="w-full">
                  <Icon name="Check" size={16} className="mr-2" />
                  Выдать товар
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Plus" size={20} />
                  Поступление на склад
                </CardTitle>
                <CardDescription>Добавьте новое оборудование или расходные материалы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Наименование *</Label>
                    <Input
                      id="item-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Введите название товара"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select onValueChange={(value: any) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cartridge">
                          <div className="flex items-center gap-2">
                            <Icon name="Printer" size={16} />
                            Картридж
                          </div>
                        </SelectItem>
                        <SelectItem value="equipment">
                          <div className="flex items-center gap-2">
                            <Icon name="Monitor" size={16} />
                            Оборудование
                          </div>
                        </SelectItem>
                        <SelectItem value="supplies">
                          <div className="flex items-center gap-2">
                            <Icon name="Package" size={16} />
                            Расходники
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="Дополнительная информация о товаре"
                  />
                </div>
                
                <Button onClick={addItem} className="w-full">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить на склад
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}