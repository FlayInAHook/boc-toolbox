import { HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import clone from "nanoclone";
import { AsignedTodo, getSonarQubeProjects, getSonarQubeTodos, sanityLocalTeamAtom, SONARQUBE_TODO_LINK_EXTERNAL } from "../../queries/sanity";
import FrostedGlassCard from "../FrostedGlassCard";




const SonarQubeTodos: React.FC = () => {
  const { isPending, data: sonarQubeTodos, error } = useQuery({
    queryKey: ['sonarQubeTodos'],
    queryFn: getSonarQubeTodos,
  });


  const {isPending: sonarQubeProjectsIsPending, data: sonarQubeProjectData, error: sonarQubeProjectError} = useQuery({
    queryKey: ["sonarQubeProjects"],
    queryFn: getSonarQubeProjects,
  });

  const localTeam = useAtomValue(sanityLocalTeamAtom);

  if (isPending || sonarQubeProjectsIsPending) return new Array(9).fill(0).map((_, i) => <FrostedGlassCard key={i} />);
  if (error || sonarQubeProjectError) return <div>Error: {error?.message ?? sonarQubeProjectError?.message}</div>;

  
  const getTodosPerProjectName = (asignedTodo: AsignedTodo) => {
    const todosPerProjectName: { [key: string]: number } = {};
    asignedTodo.todos.forEach((todo) => {
      if (todosPerProjectName[todo.project]) {
        todosPerProjectName[todo.project]++;
      } else {
        todosPerProjectName[todo.project] = 1;
      }
    });
    return todosPerProjectName;
  }

  const filteredTodos = clone(sonarQubeTodos.filter((asignedTodo) => localTeam?.config.members?.find((member) => member == asignedTodo.assignee)));
  filteredTodos.forEach((asignedTodo) => {
    asignedTodo.todos = asignedTodo.todos.filter((todo) => localTeam?.config.sonarQubeProjects?.find((projectKey) => projectKey == todo.project));
  });

  filteredTodos.sort((a, b) => b.todos.length - a.todos.length || a.assignee?.localeCompare(b.assignee ?? ""));  

  return filteredTodos.map((todo: AsignedTodo) => {
    const assigneeName = todo.assignee ?? "Unassigned";
    if (todo.todos.length == 0) return null;
    return <FrostedGlassCard>
      <HStack mb={3}>
        {assigneeName == "Unassigned" ? 
          <Text fontSize="2xl" marginTop="-1.5">😱</Text> : 
          <Image src={"https://gravatar.com/avatar/" + todo.avatar + "?s=30&d=identicon"} alt={assigneeName} boxSize='30px' borderRadius='full'  />
        }
        <Text fontSize={"lg"}>{assigneeName}</Text>
      </HStack>
      <VStack alignItems={"flex-start"}>
        {Object.entries(getTodosPerProjectName(todo)).map(([projectName, todoCount]) => {
          const project = sonarQubeProjectData.find((project) => project.key == projectName);
          if (!project) return null;
          const todoKeys = todo.todos.filter((todo) => todo.project == projectName).map((todo) => todo.key);
          const openLink = `${SONARQUBE_TODO_LINK_EXTERNAL}?issues=${todoKeys.join(",")}&open=${todoKeys[0]}&id=${project}`;
          const todosText = todoCount == 1 ? "todo" : "todos";
          return <Text key={project.key}>
                    <Link href={openLink} target="_blank">
                      {project.name} - {todoCount} {todosText}
                    </Link>
                  </Text>
        })}
      </VStack>
      
    </FrostedGlassCard>
  });
};

export default SonarQubeTodos;