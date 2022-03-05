use itertools::Itertools;
const T: &str = include_str!("./../../IN/01");

fn main(){
    let x = T.split('\n').map ( |it| it.parse::<i32>().unwrap() ).collect::<Vec<_>>();
    println!("{} {}", 
        x.iter().tuple_windows::<(_, _)>().filter ( |(a, b)| a < b ).count(),
        x.iter().tuple_windows::<(_,_,_)>().map (|(a, b, c)| a + b + c ).tuple_windows::<(_, _)>().filter (|(a, b)| a < b ).count()
    );
}