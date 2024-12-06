

document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token'); 
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    // Seleciona os elementos onde as informações do usuário e mensagens serão exibidas
   const messageElement = document.getElementById('message');
    // Realiza uma requisição para obter os dados do usuário autenticado
    const response = await fetch('http://localhost:3000/user', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // Certifique-se de que o token está sendo enviado
        }
    });
    if (response.ok) {

        userData = await response.json();
        
       
    } else {

        messageElement.textContent = 'Erro ao obter dados do usuário.';
    }

    document.getElementById('groupRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const groupName = document.getElementById("groupName").value;
        const groupDescription = document.getElementById("groupDescription").value;
        const groupPassword = document.getElementById('groupPassword').value

        const createResponse = await fetch('http://localhost:3000/createGroup', {
            method: 'POST', // Define o método HTTP como POST, ideal para enviar dados ao servidor
            headers: { 'Content-Type': 'application/json' }, // Define o cabeçalho para indicar que os dados estão em JSON
            // Converte os valores de email e senha para uma string JSON para enviar no corpo da solicitação
            body: JSON.stringify({ groupName, groupDescription,groupPassword })
        });
        const messageElement = document.getElementById('message');


        /*preciso pegar o id do grupo e do usuário que o criou, passo então para o método junto da boolean admin, que leva um true, este que sinaliza ao banco que o usuário é
        um admin do grupo*/

        const username = userData.username;//recupera o id do usuário, nesta tela pega do usuário que está logado.
        console.log("teste", username)
        const idResponse = await fetch(`http://localhost:3000/userId?username=${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const idData = await idResponse.json(); // Extrai o corpo da resposta como JSON

        console.log(idData)

        console.log("teste", groupName)
        const groupResponse = await fetch(`http://localhost:3000/groupId?group=${encodeURIComponent(groupName)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }); 
        let idGroup = await groupResponse.json();
        console.log(idGroup)

        if (createResponse.ok && idResponse.ok && groupResponse.ok) {


            // Se o registro for bem-sucedido, exibe uma mensagem de confirmação
            messageElement.textContent = 'Grupoo registrado com sucesso!';
            const response = await fetch('http://localhost:3000/relationGroup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId:idGroup.id.id, userId: idData.id.id, admin: true })
            });



        } else {
            // Caso a resposta não seja bem-sucedida, extrai a mensagem de erro do corpo da resposta
            const errorMessage = await response.text();
            // Define o texto do elemento de mensagem para mostrar o erro na interface do usuário
            messageElement.textContent = errorMessage;
        }
    })
    document.getElementById('groupLoginForm').addEventListener('submit', async (e) => {
      e.preventDefault(); // Impede o envio padrão do formulário
      
      const groupName = document.getElementById("groupLoginName").value;
      const username = userData.username; // Assume que userData.username está definido
      const groupPassword = document.getElementById("groupLoginPassword").value; // Pegando a senha inserida no formulário
      console.log(groupPassword)
      
      console.log("Teste:", username);
      
      try {
          // Buscar o ID do usuário
          const idResponse = await fetch(`http://localhost:3000/userId?username=${encodeURIComponent(username)}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
          });
      
          const idData = await idResponse.json(); // Extrai o corpo da resposta como JSON
          console.log(idData);
      
          // Buscar o ID do grupo
          console.log("Teste:", groupName);
          const groupResponse = await fetch(`http://localhost:3000/groupId?group=${encodeURIComponent(groupName)}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
          });
      
          let idGroup;
          const contentType = groupResponse.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
              idGroup = await groupResponse.json();
              console.log(idGroup);
          } else {
              const errorText = await groupResponse.text();
              console.error('Erro ao acessar o grupo:', errorText);
              document.getElementById('message').textContent = errorText || 'Erro ao acessar o grupo.';
              return; // Sai da função caso a resposta não seja JSON
          }
      
          // Verificar se a senha do grupo está correta
          const passwordCheckResponse = await fetch('http://localhost:3000/api/verify-group', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ groupName: groupName, password: groupPassword })
          });
          
          const passwordCheckData = await passwordCheckResponse.json();
          if (passwordCheckData.success) {
              // Se a senha estiver correta, continuar com o registro no grupo
              messageElement.textContent = 'Grupo registrado com sucesso!';
              const response = await fetch('http://localhost:3000/relationGroup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ groupId: idGroup.id.id, userId: idData.id.id, admin: false })
              });
      
              const data = await response.json();
      
              if (response.ok) {
                  console.log('Grupo acessado com sucesso:', data);
                  document.getElementById('message').textContent = 'Você entrou no grupo com sucesso!';
              } else {
                  console.error('Erro ao acessar o grupo:', data);
                  document.getElementById('message').textContent = data.error || 'Erro ao entrar no grupo.';
              }
          } else {
              // Se a senha estiver incorreta
              document.getElementById('message').textContent = 'Senha incorreta. Tente novamente.';
          }
      } catch (error) {
          console.error('Erro na requisição:', error);
          document.getElementById('message').textContent = 'Erro na requisição. Tente novamente.';
      }
  });
    
// NUM SEI SE TA PEGANDO
const groupsContainer = document.getElementById('groupsContainer');
  try {
    // Requisição para obter os grupos do usuário logado
    const response = await fetch('http://localhost:3000/userGroups', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`  // Corrigido aqui
      }
    });

    if (response.ok) {
      const groups = await response.json();

      // Renderiza os grupos em divs
      groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.textContent = group.group_name;
        groupDiv.classList.add('group-item'); 
        groupsContainer.appendChild(groupDiv);
      });
    } else {
      groupsContainer.textContent = 'Erro ao carregar grupos.';
    }
  } catch (error) {
    console.error('Erro:', error);
    groupsContainer.textContent = 'Erro ao carregar grupos.';
  }
});

// TEsta aqui dai Div id="grupsContainer"


