f = r'c:\Users\acer\Desktop\Integracion\Intitech-Development-main\Intitech-Development-main\src\components\MyAccount\index.tsx'
with open(f, 'r', encoding='utf-8') as fp:
    content = fp.read()

old = "Dirección: {userProfile?.shippingAddress?.street ? `, ` : 'No guardada aún'}"
new = "Dirección: {userProfile?.shippingAddress?.street ? `${userProfile.shippingAddress.street}, ${userProfile.shippingAddress.city}` : 'No guardada aún'}"

count = content.count(old)
print('Matches:', count)
content = content.replace(old, new)
with open(f, 'w', encoding='utf-8') as fp:
    fp.write(content)
print('Done')
