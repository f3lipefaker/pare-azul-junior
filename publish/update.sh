image="pare-azul-junior" 
namespace="viptech"

echo "Removendo imagens anteriores..."
docker rmi -f ${image}
docker rmi -f juca266/${image}

echo "Buildar nova imagem..."
docker build -t ${image} /home/fbdomingos/developer/${image}/

echo "publicar no Hub..."
docker tag ${image}:latest juca266/${image}:latest
docker push juca266/${image}:latest

echo "subir o sistema..."
kubectl delete -f /home/fbdomingos/developer/${image}/publish/${image}.yaml
kubectl apply -f /home/fbdomingos/developer/${image}/publish/${image}.yaml
kubectl apply -f /home/fbdomingos/developer/${image}/publish/service-${image}.yaml