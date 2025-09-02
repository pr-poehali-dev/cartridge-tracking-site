import { useState, useEffect } from 'react';
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
  subcategory: 'printing' | 'consumables' | 'tools';
  quantity: number;
  price: number;
  description?: string;
}

interface IssueRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  recipient: string;
  department: string;
  date: string;
  subcategory: string;
}

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('warehouse');
  
  // Управление отделами
  const [departments, setDepartments] = useState<string[]>([
    'IT отдел', 'Бухгалтерия', 'Отдел кадров', 'Отдел продаж', 
    'Администрация', 'Производство', 'Склад'
  ]);
  const [newDepartment, setNewDepartment] = useState('');
  
  // Редактирование товаров
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Фильтрация по месяцам
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'HP LaserJet 1020', category: 'equipment', subcategory: 'printing', quantity: 3, price: 15000, description: 'Лазерный принтер' },
    { id: '2', name: 'Картридж HP CE285A', category: 'cartridge', subcategory: 'printing', quantity: 12, price: 2500, description: 'Черный картридж' },
    { id: '3', name: 'Бумага А4', category: 'supplies', subcategory: 'consumables', quantity: 500, price: 300, description: 'Офисная бумага' },
    { id: '4', name: 'Canon PIXMA G3420', category: 'equipment', subcategory: 'printing', quantity: 2, price: 12000, description: 'Струйный принтер' },
    { id: '5', name: 'Картридж Canon PG-46', category: 'cartridge', subcategory: 'printing', quantity: 8, price: 1800, description: 'Черный картридж Canon' },
    { id: '6', name: 'Отвертка крестовая', category: 'equipment', subcategory: 'tools', quantity: 5, price: 500, description: 'Инструмент для ремонта' },
    { id: '7', name: 'Салфетки для чистки', category: 'supplies', subcategory: 'consumables', quantity: 25, price: 50, description: 'Влажные салфетки' }
  ]);

  const [issueHistory, setIssueHistory] = useState<IssueRecord[]>([]);

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedInventory = localStorage.getItem('inventory');
      const savedIssueHistory = localStorage.getItem('issueHistory');
      const savedDepartments = localStorage.getItem('departments');
      
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }
      if (savedIssueHistory) {
        setIssueHistory(JSON.parse(savedIssueHistory));
      }
      if (savedDepartments) {
        setDepartments(JSON.parse(savedDepartments));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить сохраненные данные', variant: 'destructive' });
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (error) {
      console.error('Ошибка сохранения склада:', error);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('issueHistory', JSON.stringify(issueHistory));
    } catch (error) {
      console.error('Ошибка сохранения истории:', error);
    }
  }, [issueHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('departments', JSON.stringify(departments));
    } catch (error) {
      console.error('Ошибка сохранения отделов:', error);
    }
  }, [departments]);

  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'cartridge',
    subcategory: 'printing',
    quantity: 0,
    price: 0,
    description: ''
  });

  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  const [issueForm, setIssueForm] = useState({
    itemId: '',
    quantity: 0,
    recipient: '',
    department: ''
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
    if (!newItem.name || newItem.quantity <= 0 || !newItem.subcategory || newItem.price <= 0) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }
    
    const item: InventoryItem = {
      ...newItem,
      id: Date.now().toString()
    };
    
    setInventory([...inventory, item]);
    setNewItem({ name: '', category: 'cartridge', subcategory: 'printing', quantity: 0, price: 0, description: '' });
    toast({ title: 'Добавлено', description: `${item.name} добавлен на склад` });
  };

  const issueItem = () => {
    if (!issueForm.itemId || !issueForm.recipient || !issueForm.department || issueForm.quantity <= 0) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }

    const item = inventory.find(i => i.id === issueForm.itemId);
    if (!item || item.quantity < issueForm.quantity) {
      toast({ title: 'Ошибка', description: 'Недостаточно товара на складе', variant: 'destructive' });
      return;
    }

    const issueRecord: IssueRecord = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      quantity: issueForm.quantity,
      unitPrice: item.price,
      totalPrice: item.price * issueForm.quantity,
      recipient: issueForm.recipient,
      department: issueForm.department,
      date: new Date().toLocaleDateString('ru-RU'),
      subcategory: item.subcategory
    };

    setIssueHistory([...issueHistory, issueRecord]);

    setInventory(inventory.map(i => 
      i.id === issueForm.itemId 
        ? { ...i, quantity: i.quantity - issueForm.quantity }
        : i
    ));

    setIssueForm({ itemId: '', quantity: 0, recipient: '', department: '' });
    toast({ title: 'Выдано', description: `${item.name} выдан отделу ${issueForm.department}` });
  };

  const editItem = (item: InventoryItem) => {
    setEditingItem({...item});
    setIsEditDialogOpen(true);
  };

  const updateItem = () => {
    if (!editingItem || !editingItem.name || editingItem.quantity < 0 || editingItem.price <= 0) {
      toast({ title: 'Ошибка', description: 'Заполните все поля корректно', variant: 'destructive' });
      return;
    }

    setInventory(inventory.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({ title: 'Обновлено', description: `${editingItem.name} успешно обновлен` });
  };

  const deleteItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setInventory(inventory.filter(i => i.id !== itemId));
      toast({ title: 'Удалено', description: `${item.name} удален со склада` });
    }
  };

  const addDepartment = () => {
    if (!newDepartment.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название отдела', variant: 'destructive' });
      return;
    }
    if (departments.includes(newDepartment.trim())) {
      toast({ title: 'Ошибка', description: 'Такой отдел уже существует', variant: 'destructive' });
      return;
    }
    setDepartments([...departments, newDepartment.trim()]);
    setNewDepartment('');
    toast({ title: 'Добавлен', description: `Отдел "${newDepartment.trim()}" добавлен` });
  };

  const removeDepartment = (departmentName: string) => {
    if (departments.length <= 1) {
      toast({ title: 'Ошибка', description: 'Нельзя удалить последний отдел', variant: 'destructive' });
      return;
    }
    setDepartments(departments.filter(dept => dept !== departmentName));
    toast({ title: 'Удален', description: `Отдел "${departmentName}" удален` });
  };

  const exportData = () => {
    const data = {
      inventory,
      issueHistory,
      departments,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Бэкап создан', description: 'Данные экспортированы' });
  };

  const clearAllData = () => {
    if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      setInventory([]);
      setIssueHistory([]);
      setDepartments(['IT отдел', 'Бухгалтерия', 'Отдел кадров']);
      localStorage.clear();
      toast({ title: 'Данные очищены', description: 'Все данные были удалены' });
    }
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

  const getSubcategoryLabel = (subcategory: string) => {
    switch (subcategory) {
      case 'printing': return 'Печатающая техника';
      case 'consumables': return 'Прочие расходные материалы';
      case 'tools': return 'Инструменты';
      default: return 'Прочее';
    }
  };

  const getSubcategoryIcon = (subcategory: string) => {
    switch (subcategory) {
      case 'printing': return 'Printer';
      case 'consumables': return 'Package';
      case 'tools': return 'Wrench';
      default: return 'Box';
    }
  };

  const filteredInventory = activeSubcategory === 'all' 
    ? inventory 
    : inventory.filter(item => item.subcategory === activeSubcategory);

  // Фильтрация истории по месяцам
  const filteredHistory = issueHistory.filter(record => {
    const recordDate = new Date(record.date.split('.').reverse().join('-'));
    return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
  });

  // Получение списка доступных месяцев и лет
  const availableMonths = [...new Set(issueHistory.map(record => {
    const date = new Date(record.date.split('.').reverse().join('-'));
    return `${date.getFullYear()}-${date.getMonth()}`;
  }))].sort().reverse();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

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
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
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
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="warehouse" className="space-y-4">
            <div className="flex gap-2 mb-6 flex-wrap">
              <Button
                variant={activeSubcategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubcategory('all')}
                className="flex items-center gap-2"
              >
                <Icon name="Grid3x3" size={16} />
                Все товары
              </Button>
              <Button
                variant={activeSubcategory === 'printing' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubcategory('printing')}
                className="flex items-center gap-2"
              >
                <Icon name="Printer" size={16} />
                Печатающая техника
              </Button>
              <Button
                variant={activeSubcategory === 'consumables' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubcategory('consumables')}
                className="flex items-center gap-2"
              >
                <Icon name="Package" size={16} />
                Прочие расходники
              </Button>
              <Button
                variant={activeSubcategory === 'tools' ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSubcategory('tools')}
                className="flex items-center gap-2"
              >
                <Icon name="Wrench" size={16} />
                Инструменты
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInventory.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon name={getSubcategoryIcon(item.subcategory)} size={24} className="text-primary" />
                      <Badge variant={item.quantity > 5 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}>
                        {item.quantity} шт
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="Tag" size={14} />
                        {getCategoryLabel(item.category)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Icon name="FolderOpen" size={14} />
                        {getSubcategoryLabel(item.subcategory)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                          <Icon name="Ruble" size={14} />
                          {item.price.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editItem(item)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredInventory.length === 0 && (
              <Card className="text-center py-12 col-span-full">
                <CardContent>
                  <Icon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeSubcategory === 'all' ? 'Склад пуст' : 'В этом подразделе нет товаров'}
                  </h3>
                  <p className="text-gray-600">
                    {activeSubcategory === 'all' 
                      ? 'Добавьте первый товар через раздел "Поступление"'
                      : 'Добавьте товары в этот подраздел через "Поступление"'
                    }
                  </p>
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
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Получатель *</Label>
                    <Input
                      id="recipient"
                      value={issueForm.recipient}
                      onChange={(e) => setIssueForm({...issueForm, recipient: e.target.value})}
                      placeholder="ФИО сотрудника"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Отдел *</Label>
                    <Select onValueChange={(value) => setIssueForm({...issueForm, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label htmlFor="subcategory">Подраздел склада *</Label>
                    <Select onValueChange={(value: any) => {
                      setNewItem({...newItem, subcategory: value});
                      // Автоматически выбираем подходящую категорию
                      if (value === 'printing') {
                        setNewItem(prev => ({...prev, subcategory: value, category: 'equipment'}));
                      } else if (value === 'consumables') {
                        setNewItem(prev => ({...prev, subcategory: value, category: 'supplies'}));
                      } else if (value === 'tools') {
                        setNewItem(prev => ({...prev, subcategory: value, category: 'equipment'}));
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите подраздел" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="printing">
                          <div className="flex items-center gap-2">
                            <Icon name="Printer" size={16} />
                            Печатающая техника
                          </div>
                        </SelectItem>
                        <SelectItem value="consumables">
                          <div className="flex items-center gap-2">
                            <Icon name="Package" size={16} />
                            Прочие расходные материалы
                          </div>
                        </SelectItem>
                        <SelectItem value="tools">
                          <div className="flex items-center gap-2">
                            <Icon name="Wrench" size={16} />
                            Инструменты
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Тип товара</Label>
                    <Select value={newItem.category} onValueChange={(value: any) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип" />
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
                
                <div className="grid gap-4 md:grid-cols-2">
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
                    <Label htmlFor="price">Цена за единицу (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.price || ''}
                      onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
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

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={20} />
                  Фильтр по периоду
                </CardTitle>
                <CardDescription>Выберите месяц и год для просмотра отчета</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Месяц</Label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Год</Label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} className="text-green-600" />
                    Выдано за {monthNames[selectedMonth]} {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredHistory.reduce((sum, record) => sum + record.totalPrice, 0).toLocaleString('ru-RU')} ₽
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Операций: {filteredHistory.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Users" size={20} className="text-blue-600" />
                    Отделы за месяц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(filteredHistory.map(record => record.department)).size}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Активных отделов
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Package" size={20} className="text-orange-600" />
                    Товары за месяц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredHistory.reduce((sum, record) => sum + record.quantity, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Единиц выдано
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" size={20} />
                  Отчет по отделам
                </CardTitle>
                <CardDescription>Затраты по отделам и подразделам</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Нет данных за {monthNames[selectedMonth]} {selectedYear}
                    </h3>
                    <p className="text-gray-600">Выберите другой период или выдайте товары</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(
                      filteredHistory.reduce((acc: Record<string, {total: number, items: number, subcategories: Set<string>}>, record) => {
                        if (!acc[record.department]) {
                          acc[record.department] = {total: 0, items: 0, subcategories: new Set()};
                        }
                        acc[record.department].total += record.totalPrice;
                        acc[record.department].items += record.quantity;
                        acc[record.department].subcategories.add(record.subcategory);
                        return acc;
                      }, {})
                    ).map(([department, data]) => (
                      <div key={department} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg flex items-center gap-2">
                            <Icon name="Building" size={16} />
                            {department}
                          </h4>
                          <Badge variant="outline" className="text-lg font-bold">
                            {data.total.toLocaleString('ru-RU')} ₽
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Icon name="Package" size={14} />
                            Товаров: {data.items} шт
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Layers" size={14} />
                            Подразделов: {data.subcategories.size}
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Детализация за {monthNames[selectedMonth]} {selectedYear}:</p>
                          {filteredHistory
                            .filter(record => record.department === department)
                            .map((record) => (
                              <div key={record.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                  <Icon name={getSubcategoryIcon(record.subcategory)} size={14} />
                                  <span>{record.itemName}</span>
                                  <Badge variant="secondary" size="sm">
                                    {record.quantity} шт
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">{record.totalPrice.toLocaleString('ru-RU')} ₽</div>
                                  <div className="text-gray-500">{record.date}</div>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="Edit" size={20} />
                  Редактировать товар
                </DialogTitle>
                <DialogDescription>
                  Измените параметры товара на складе
                </DialogDescription>
              </DialogHeader>
              {editingItem && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Наименование *</Label>
                      <Input
                        id="edit-name"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        placeholder="Введите название товара"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-subcategory">Подраздел *</Label>
                      <Select 
                        value={editingItem.subcategory}
                        onValueChange={(value: any) => setEditingItem({...editingItem, subcategory: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="printing">
                            <div className="flex items-center gap-2">
                              <Icon name="Printer" size={16} />
                              Печатающая техника
                            </div>
                          </SelectItem>
                          <SelectItem value="consumables">
                            <div className="flex items-center gap-2">
                              <Icon name="Package" size={16} />
                              Прочие расходные материалы
                            </div>
                          </SelectItem>
                          <SelectItem value="tools">
                            <div className="flex items-center gap-2">
                              <Icon name="Wrench" size={16} />
                              Инструменты
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-quantity">Количество *</Label>
                      <Input
                        id="edit-quantity"
                        type="number"
                        min="0"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value) || 0})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">Цена (₽) *</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Тип</Label>
                      <Select 
                        value={editingItem.category}
                        onValueChange={(value: any) => setEditingItem({...editingItem, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cartridge">Картридж</SelectItem>
                          <SelectItem value="equipment">Оборудование</SelectItem>
                          <SelectItem value="supplies">Расходники</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Описание</Label>
                    <Input
                      id="edit-description"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Дополнительная информация о товаре"
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={updateItem} className="flex-1">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить изменения
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Building" size={20} />
                    Управление отделами
                  </CardTitle>
                  <CardDescription>Добавляйте и удаляйте отделы для выдачи товаров</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-department">Новый отдел</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-department"
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        placeholder="Название отдела"
                        onKeyPress={(e) => e.key === 'Enter' && addDepartment()}
                      />
                      <Button onClick={addDepartment} size="sm">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Текущие отделы ({departments.length})</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {departments.map((dept) => (
                        <div key={dept} className="flex items-center justify-between p-2 border rounded">
                          <span className="flex items-center gap-2">
                            <Icon name="Building" size={14} />
                            {dept}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDepartment(dept)}
                            className="text-red-600 hover:bg-red-50"
                            disabled={departments.length <= 1}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Database" size={20} />
                    Управление данными
                  </CardTitle>
                  <CardDescription>Экспорт, очистка и управление сохраненными данными</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Статистика данных</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Товаров на складе</div>
                        <div className="text-lg font-bold text-blue-600">{inventory.length}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">Операций выдачи</div>
                        <div className="text-lg font-bold text-green-600">{issueHistory.length}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={exportData} className="w-full" variant="outline">
                      <Icon name="Download" size={16} className="mr-2" />
                      Экспорт данных в JSON
                    </Button>
                    
                    <Button 
                      onClick={clearAllData} 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      variant="outline"
                    >
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Очистить все данные
                    </Button>
                  </div>
                  
                  <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    <Icon name="Info" size={14} className="inline mr-1" />
                    Все изменения автоматически сохраняются в браузере
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Shield" size={20} />
                  Информация о системе
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Версия системы</div>
                    <div>1.2.0</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Последнее обновление</div>
                    <div>{new Date().toLocaleDateString('ru-RU')}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Хранение данных</div>
                    <div>Локальное (браузер)</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-sm text-blue-800">
                    <Icon name="Info" size={14} className="inline mr-1" />
                    <strong>Важно:</strong> Данные сохраняются только в этом браузере. Рекомендуется периодически создавать экспорт данных.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}